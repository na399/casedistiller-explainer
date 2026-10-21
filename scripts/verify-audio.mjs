// Re-checks the final public/audio/<SceneId>.wav clips against the script with the
// speech-to-text worker. Usage: ASR_PYTHON=<python> node scripts/verify-audio.mjs
import { readFileSync, existsSync } from "node:fs";
import { spawn } from "node:child_process";
import { createInterface } from "node:readline";
import { resolve } from "node:path";

const narration = JSON.parse(readFileSync("src/narration.json", "utf8"));
const proc = spawn(process.env.ASR_PYTHON, ["scripts/asr_check.py", "small.en"], { stdio: ["pipe", "pipe", "ignore"] });
const lines = createInterface({ input: proc.stdout })[Symbol.asyncIterator]();
await lines.next(); // ready
let worst = 1;
for (const id of Object.keys(narration)) {
  const path = `public/audio/${id}.wav`;
  if (!existsSync(path)) { console.log(`${id.padEnd(11)} missing`); continue; }
  proc.stdin.write(JSON.stringify({ path: resolve(path), text: narration[id] }) + "\n");
  const r = JSON.parse((await lines.next()).value);
  worst = Math.min(worst, r.coverage ?? 0);
  console.log(`${id.padEnd(11)} heard ${Math.round(r.coverage * 100)}%, extra ${Math.round(r.extra * 100)}%${r.tail_ok === false ? ", ENDING NOT HEARD" : ""}${r.missing?.length ? `, missed: ${r.missing.join(" ")}` : ""}`);
}
proc.stdin.end();
console.log(`lowest coverage ${Math.round(worst * 100)}%`);
