// Writes narration/script.md and narration/script.json from src/narration.json,
// with the scene timings the video derives from the same text.
// Usage: node scripts/export-script.mjs
import { readFileSync, writeFileSync, mkdirSync } from "node:fs";

// Keep these in step with src/timing.ts (lead, tail, overrides, estimate rate)
// and with ORDER in src/Video.tsx (scene order and minimum frames).
const FPS = 30, WPS = 2.1, LEAD = 0.8, TAIL = 0.8;
const LEAD_OVERRIDES = { Cover: 1.8 };
const TAIL_OVERRIDES = { Foil: 3.0 };
const MIN = {
  Cover: 330, Compare: 720, Approach: 480, Routes: 420, Expansion: 390, Masked: 420,
  Candidates: 540, Foil: 1500, Selection: 630, Scorecard: 600, AgentLoop: 630, AgentEdit: 480,
  Tasks: 600, Ems: 540, Act: 630, Split: 450, Execution: 540, Close: 300,
};

const narration = JSON.parse(readFileSync(new URL("../src/narration.json", import.meta.url), "utf8"));
const missing = Object.keys(MIN).filter((id) => !narration[id]);
const extra = Object.keys(narration).filter((id) => !(id in MIN));
if (missing.length || extra.length) throw new Error(`scene ids differ: missing ${missing} extra ${extra}`);
const clipsUrl = new URL("../src/audio-durations.json", import.meta.url);
let clips = {};
try { clips = JSON.parse(readFileSync(clipsUrl, "utf8")); } catch {}
let perf = {};
try { perf = JSON.parse(readFileSync(new URL("../narration/voice/performance.json", import.meta.url), "utf8")); } catch {}
const words = (t) => t.trim().split(/\s+/).length;
const mmss = (sec) => `${Math.floor(sec / 60)}:${String(Math.floor(sec % 60)).padStart(2, "0")}`;

let start = 0, totalWords = 0;
const rows = Object.keys(MIN).map((id, i) => {
  const text = narration[id];
  const w = words(text);
  const measured = clips[id] !== undefined;
  const speech = measured ? clips[id] : w / WPS;
  const lead = LEAD_OVERRIDES[id] ?? LEAD, tail = TAIL_OVERRIDES[id] ?? TAIL;
  const frames = Math.max(MIN[id], Math.ceil((speech + lead + tail) * FPS));
  const row = { n: i + 1, id, start: start / FPS, frames, seconds: frames / FPS, words: w, speechSeconds: +speech.toFixed(1), measured, leadSeconds: lead, tailSeconds: tail, text };
  start += frames; totalWords += w;
  return row;
});

mkdirSync(new URL("../narration/", import.meta.url), { recursive: true });
writeFileSync(new URL("../narration/script.json", import.meta.url), JSON.stringify({ fps: FPS, wordsPerSecond: WPS, leadSeconds: LEAD, tailSeconds: TAIL, leadOverrides: LEAD_OVERRIDES, tailOverrides: TAIL_OVERRIDES, totalFrames: start, scenes: rows }, null, 2));

const overrides = (o) => Object.entries(o).map(([k, v]) => `${k} ${v} s`).join(", ");
const md = [
  "# CaseDistiller explainer: narration script",
  "",
  `${rows.length} scenes · ${totalWords} words · ${mmss(start / FPS)} total · ${rows.filter((r) => r.measured).length} scenes timed to measured voice clips, the rest estimated at ${WPS} words/s.`,
  "",
  `A scene lasts its minimum build time or its voice clip plus lead-in and tail, whichever is longer. The lead-in is ${LEAD} s (${overrides(LEAD_OVERRIDES)}); the tail is ${TAIL} s (${overrides(TAIL_OVERRIDES)}). Clips live in \`public/audio/<Scene id>.wav\` (made by \`scripts/tts.mjs\`); run \`node scripts/audio-durations.mjs\` after changing them.`,
  "",
  "| # | Scene | Starts | Length | Voice | Words |",
  "|---|---|---|---|---|---|",
  ...rows.map((r) => `| ${r.n} | ${r.id} | ${mmss(r.start)} | ${r.seconds.toFixed(1)} s | ${r.speechSeconds.toFixed(1)} s${r.measured ? "" : " (est.)"} | ${r.words} |`),
  "",
  ...rows.flatMap((r) => [
    `## ${r.n}. ${r.id} (${mmss(r.start)}, ${r.seconds.toFixed(1)} s)`,
    "",
    r.text,
    "",
    ...(perf[r.id] ? [`> Directed: ${perf[r.id]}`, ""] : []),
  ]),
].join("\n");
writeFileSync(new URL("../narration/script.md", import.meta.url), md);
console.log(`${rows.length} scenes, ${totalWords} words, ${mmss(start / FPS)} (${start} frames)`);
