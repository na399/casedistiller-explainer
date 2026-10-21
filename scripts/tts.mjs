// Synthesises one voice clip per scene with Fish Audio Drama-3 through the Bifrost gateway
// (steward-v2 backend), cloning the voice in narration/voice/reference.wav.
//
// Usage:
//   node scripts/tts.mjs [--env path/to/.env] [--only Cover,Compare] [--tempo 1.1] [--max-pause 0.8]
//                        [--jobs 1] [--max-words 400] [--fresh]
//
// Endpoint settings come from the .env file or the environment. The first name found wins:
//   base URL: TTS_BASE_URL, BIFROST_ENDPOINT, BIFROST_BASE_URL, BIFROST_URL
//   API key:  TTS_API_KEY, BIFROST_API_KEY, BIFROST_KEY
//   model:    TTS_MODEL (default: the gateway's model id containing "/fishaudio/drama-3@")
//
// Each scene is sent as one request by default (--max-words N splits it into sentence
// groups of at most N words). Every clip is checked (not capped, no long silence, plausible
// speaking rate) and retried if needed; groups are trimmed and joined with short pauses. Accepted groups are cached in narration/voice/chunks/ by
// text hash, so a rerun only redoes what changed (--fresh ignores the cache).
// Output: public/audio/<SceneId>.wav
import { readFileSync, existsSync, mkdirSync, openSync, writeFileSync } from "node:fs";
import { createHash } from "node:crypto";
import { execFileSync, spawn } from "node:child_process";
import { createInterface } from "node:readline";
import { tmpdir } from "node:os";
import { join as join_ } from "node:path";
import { analyse, capPauses, join, normalize, readWav, trim, writeWav } from "./wav.mjs";

const arg = (name) => {
  const i = process.argv.indexOf(`--${name}`);
  return i > 0 ? process.argv[i + 1] : undefined;
};
const FRESH = process.argv.includes("--fresh");
const JOBS = Number(arg("jobs") ?? 1);
// The endpoint's generation ceiling is now about 190 s, so a whole scene (under 80 words)
// fits in one request. Lower MAX_WORDS to split scenes into sentence groups again.
const MAX_WORDS = Number(arg("max-words") ?? 400);
const CAP_SECONDS = Number(arg("cap") ?? 185); // a clip this long was probably cut off
const GAP_SECONDS = 0.35;  // pause inserted between groups
const MAX_PAUSE = Number(arg("max-pause") ?? 0.8); // longer silences are shortened to this
// The gateway's speed field resamples (pitch shifts), so keep it at 1.0 and get pace from
// the directions instead. TEMPO then time-stretches each scene with pitch and formants kept
// (ffmpeg rubberband filter; set FFMPEG to an ffmpeg build that has it).
const SPEED = Number(arg("speed") ?? 1.0);
const TEMPO = Number(arg("tempo") ?? 1.0);
const FFMPEG = process.env.FFMPEG;
if (TEMPO !== 1 && !FFMPEG) throw new Error("--tempo needs FFMPEG set to an ffmpeg with the rubberband filter");
const TRIES = 6;

const envPath = arg("env") ?? ".env";
if (existsSync(envPath)) {
  for (const line of readFileSync(envPath, "utf8").split(/\r?\n/)) {
    const m = line.match(/^\s*(?:export\s+)?([A-Za-z_][A-Za-z0-9_]*)\s*=\s*(.*)\s*$/);
    if (m && process.env[m[1]] === undefined) process.env[m[1]] = m[2].replace(/^(['"])(.*)\1$/, "$2");
  }
}
const pick = (...names) => names.map((n) => process.env[n]).find(Boolean);
const base = pick("TTS_BASE_URL", "BIFROST_ENDPOINT", "BIFROST_BASE_URL", "BIFROST_URL");
const key = pick("TTS_API_KEY", "BIFROST_API_KEY", "BIFROST_KEY");
if (!base || !key) {
  console.error(`No endpoint URL or key found (looked in ${envPath} and the environment).`);
  process.exit(1);
}
const root = base.replace(/\/+$/, "").replace(/\/v1$/, "");
const auth = { Authorization: `Bearer ${key}` };

let model = process.env.TTS_MODEL;
if (!model) {
  const listed = await fetch(root + "/v1/models", { headers: auth }).then((r) => r.json());
  model = listed.data.map((m) => m.id).find((id) => id.includes("/fishaudio/drama-3@"));
  if (!model) throw new Error("no Drama-3 model listed by the gateway");
}
console.log(`model: ${model}`);

// One reference per request, at most 60 s, 10 MiB of WAV and 4,096 transcript characters.
const refText = readFileSync("narration/voice/reference.txt", "utf8").trim();
const refWav = readFileSync("narration/voice/reference.wav");
if (refWav.length > 10 * 1024 * 1024 || refText.length > 4096) throw new Error("reference exceeds the endpoint limits");
const reference = { data: refWav.toString("base64"), media_type: "audio/wav", text: refText };
// Cached takes are keyed on the reference audio too, so a new recording with the same
// transcript never reuses takes made with the old voice.
const REF_HASH = createHash("sha1").update(refWav).digest("hex");

// Bracketed directions such as [short pause] or [upbeat] and paired tags such as
// <emphasis>…</emphasis> or <fast>…</fast> are performed, not spoken.
const strip = (t) => t.replace(/<\|phoneme_start\|>.*?<\|phoneme_end\|>/g, " name ").replace(/\[[^\]]*\]/g, " ").replace(/<\/?[a-z]+>/g, " ");

// Pronunciation map (narration/voice/pronunciations.json): {word: spoken form}, applied only to
// the text sent to the model, e.g. a CMU Arpabet phoneme tag that pins "CaseDistiller" with
// its final "-er". "CaseDistiller-Lite" becomes "<tag> Lite". Checks still use the script words.
const PRON_PATH = "narration/voice/pronunciations.json";
const PRON = existsSync(PRON_PATH) ? JSON.parse(readFileSync(PRON_PATH, "utf8")) : {};
const esc = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
const MUST_HEAR = Object.keys(PRON).map((w) => w.toLowerCase().replace(/[^a-z0-9']/g, ""));
const pronounce = (t) => Object.entries(PRON).reduce(
  (acc, [word, form]) => acc.replace(new RegExp(`\\b${esc(word)}\\b(-)?`, "g"), (_, h) => form + (h ? " " : "")), t);
const words = (t) => strip(t).trim().split(/\s+/).length;

// Split into sentences, then pack neighbours into groups of at most MAX_WORDS words.
function groups(text) {
  const sentences = text.match(/[^.!?]+[.!?]+["')]*\s*/g)?.map((s) => s.trim()) ?? [text];
  const out = [];
  for (const s of sentences) {
    const last = out[out.length - 1];
    if (last && words(last) + words(s) <= MAX_WORDS) out[out.length - 1] = `${last} ${s}`;
    else out.push(s);
  }
  return out;
}

// Optional speech-to-text check (scripts/asr_check.py, faster-whisper). Set ASR_PYTHON to a
// Python that has faster-whisper and num2words; without it only the timing checks run.
const ASR_PYTHON = process.env.ASR_PYTHON;
let asr = null, asrClose = () => {};
if (ASR_PYTHON) {
  // The worker is restarted if it dies; its stderr goes to narration/voice/asr.log.
  let proc = null, ready = null;
  const waiting = [];
  const start = () => {
    const log = openSync("narration/voice/asr.log", "a");
    proc = spawn(ASR_PYTHON, ["scripts/asr_check.py", process.env.ASR_MODEL ?? "small.en"], { stdio: ["pipe", "pipe", log] });
    ready = new Promise((resolve, reject) => {
      createInterface({ input: proc.stdout }).on("line", (line) => {
        const msg = JSON.parse(line);
        if (msg.ready) resolve();
        else waiting.shift()?.(msg);
      });
      proc.on("exit", (code) => {
        reject(new Error(`speech-to-text worker exited (${code})`));
        while (waiting.length) waiting.shift()({ error: `worker exited (${code})` });
        proc = null;
      });
    });
    ready.catch(() => {});
  };
  start();
  await ready;
  asr = async (path, text) => {
    if (!proc) { console.log("  restarting speech-to-text worker"); start(); await ready; }
    return new Promise((resolve) => { waiting.push(resolve); proc.stdin.write(JSON.stringify({ path, text }) + "\n"); });
  };
  process.on("exit", () => proc?.kill());
  asrClose = () => proc?.stdin.end();
  console.log("speech-to-text check: on");
} else {
  console.log("speech-to-text check: off (set ASR_PYTHON to enable)");
}

async function heard(buf, text) {
  if (!asr) return null;
  const tmp = join_(tmpdir(), `tts-check-${process.pid}.wav`);
  writeFileSync(tmp, buf);
  let r = await asr(tmp, text);
  if (r.error) r = await asr(tmp, text); // one retry, on a fresh worker if it died
  if (r.error) return `speech-to-text failed: ${r.error}`;
  if (r.coverage < 0.92 || r.extra > 0.12 || r.tail_ok === false || MUST_HEAR.some((w) => r.missing.includes(w))) {
    // Keep rejected takes and what was heard, for review.
    mkdirSync("narration/voice/rejected", { recursive: true });
    const stem = `narration/voice/rejected/${Date.now()}`;
    writeFileSync(`${stem}.wav`, buf);
    writeFileSync(`${stem}.json`, JSON.stringify({ text, ...r }, null, 2));
  }
  if (r.coverage < 0.92) return `missing words (${Math.round(r.coverage * 100)}% heard; ${r.missing.slice(0, 8).join(" ")})`;
  if (r.extra > 0.12) return `extra words (${Math.round(r.extra * 100)}%; heard "${r.transcript.slice(0, 160)}")`;
  if (r.tail_ok === false) return `ending not heard ("…${r.transcript.slice(-60)}")`;
  // Names in the pronunciation map must be heard every time; overall coverage hides a
  // garbled name ("case they steal a light" for "CaseDistiller-Lite").
  const lost = MUST_HEAR.filter((w) => r.missing.includes(w));
  if (lost.length) return `name not heard: ${lost.join(", ")} ("${r.transcript.slice(0, 70)}…")`;
  return null;
}

function check(wav, text) {
  const a = analyse(wav), speech = a.end - a.start, w = words(text);
  if (a.seconds >= CAP_SECONDS) return `hit the length cap (${a.seconds.toFixed(1)} s)`;
  // Pauses longer than MAX_PAUSE are shortened afterwards, so judge the rate without them.
  const capped = analyse(capPauses(wav, MAX_PAUSE)), talk = capped.end - capped.start;
  if (talk < w / (3.6 * SPEED)) return `too short for ${w} words (${talk.toFixed(1)} s)`;
  if (talk > w / (1.3 * SPEED)) return `too long for ${w} words (${talk.toFixed(1)} s)`;
  return null;
}

async function synth(text) {
  const res = await fetch(root + "/v1/audio/speech", {
    method: "POST",
    headers: { "Content-Type": "application/json", ...auth },
    // response_format must be "wav" (the endpoint rejects "mp3"); speed is a top-level field.
    body: JSON.stringify({
      model, input: text, voice: "default", response_format: "wav",
      ...(SPEED !== 1 ? { speed: SPEED } : {}),
      extra_params: { references: [reference] },
    }),
  });
  const buf = Buffer.from(await res.arrayBuffer());
  if (!res.ok) throw new Error(`HTTP ${res.status} ${buf.toString("utf8").slice(0, 300)}`);
  return buf;
}

mkdirSync("narration/voice/chunks", { recursive: true });
mkdirSync("public/audio", { recursive: true });

async function chunk(id, n, text) {
  const sent = pronounce(text);
  const hash = createHash("sha1").update(model.split("@")[0] + "\n" + REF_HASH + "\n" + refText + "\n" + SPEED + "\n" + sent).digest("hex").slice(0, 12);
  const path = `narration/voice/chunks/${id}-${n}-${hash}.wav`;
  if (!FRESH && existsSync(path)) return readWav(path);
  let reason = "";
  for (let attempt = 1; attempt <= TRIES; attempt++) {
    let buf;
    try {
      buf = await synth(sent);
    } catch (e) {
      reason = e.message.slice(0, 120);
      console.log(`  ${id}#${n}: try ${attempt} failed, ${reason}`);
      await new Promise((r) => setTimeout(r, 5000 * 2 ** (attempt - 1)));
      continue;
    }
    const wav = readWav(buf);
    reason = check(wav, text) ?? (await heard(buf, text));
    if (!reason) {
      writeFileSync(path, buf);
      console.log(`  ${id}#${n}: ok on try ${attempt} (${analyse(wav).seconds.toFixed(1)} s, ${words(text)} words)`);
      return wav;
    }
    console.log(`  ${id}#${n}: try ${attempt} rejected, ${reason}`);
  }
  throw new Error(`${id}#${n} failed ${TRIES} tries: ${reason}`);
}

const narration = JSON.parse(readFileSync("src/narration.json", "utf8"));
const only = arg("only")?.split(",");
const ids = Object.keys(narration).filter((id) => !only || only.includes(id));

// Directed script: the same words plus bracketed delivery directions, sounds and pauses,
// e.g. "[upbeat] ... [short pause] ...". It must match src/narration.json once the brackets go.
const PERF_PATH = "narration/voice/performance.json";
const performance = existsSync(PERF_PATH) ? JSON.parse(readFileSync(PERF_PATH, "utf8")) : {};
// Case and punctuation may differ (they steer delivery); the words may not.
const flat = (t) => strip(t).toLowerCase().replace(/[^a-z0-9'\s-]/g, " ").replace(/\s+/g, " ").trim();
for (const id of ids) {
  if (performance[id] && flat(performance[id]) !== flat(narration[id])) {
    throw new Error(`${PERF_PATH}: ${id} no longer matches src/narration.json; update its words`);
  }
}
const spoken = (id) => performance[id] ?? narration[id];

// Queue every group of every scene, run JOBS at a time, then assemble each scene.
const tasks = ids.flatMap((id) => groups(spoken(id)).map((text, n) => ({ id, n, text })));
const results = new Map();
let next = 0, failed = 0;
await Promise.all(
  Array.from({ length: JOBS }, async () => {
    while (next < tasks.length) {
      const t = tasks[next++];
      try { results.set(`${t.id}#${t.n}`, await chunk(t.id, t.n, t.text)); }
      catch (e) { failed++; console.error(`  ${e.message}`); }
    }
  }),
);

for (const id of ids) {
  const parts = tasks.filter((t) => t.id === id).map((t) => results.get(`${t.id}#${t.n}`));
  if (parts.some((p) => !p)) { console.error(`${id}: skipped, a group failed`); continue; }
  let wav = join(parts.map((p) => capPauses(trim(p), MAX_PAUSE)), GAP_SECONDS);
  if (TEMPO !== 1) {
    const raw = join_(tmpdir(), `tts-tempo-${process.pid}.wav`), out = raw.replace(/\.wav$/, "-out.wav");
    writeWav(raw, wav);
    execFileSync(FFMPEG, ["-y", "-v", "error", "-i", raw, "-af",
      `rubberband=tempo=${TEMPO}:pitch=1:window=short:formant=preserved:pitchq=quality`, "-ar", String(wav.rate), "-ac", "1", "-c:a", "pcm_s16le", out]);
    wav = readWav(out);
  }
  wav = normalize(wav);
  writeWav(`public/audio/${id}.wav`, wav);
  console.log(`${id}: ${parts.length} groups, ${(wav.samples.length / wav.rate).toFixed(1)} s`);
}
asrClose();
if (failed) process.exit(1);
