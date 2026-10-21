// Measures public/audio/<SceneId>.wav and writes src/audio-durations.json ({ id: seconds }),
// which src/Video.tsx and scripts/export-script.mjs use to time each scene to its clip.
// Usage: node scripts/audio-durations.mjs
import { readFileSync, writeFileSync, existsSync } from "node:fs";

const narration = JSON.parse(readFileSync("src/narration.json", "utf8"));
const out = {};
for (const id of Object.keys(narration)) {
  const path = `public/audio/${id}.wav`;
  if (!existsSync(path)) continue;
  const b = readFileSync(path);
  let off = 12, byteRate = 0, seconds = 0;
  while (off < b.length - 8) {
    const tag = b.toString("ascii", off, off + 4), size = b.readUInt32LE(off + 4);
    if (tag === "fmt ") byteRate = b.readUInt32LE(off + 16);
    if (tag === "data") { seconds = Math.min(size, b.length - off - 8) / byteRate; break; }
    off += 8 + size + (size % 2);
  }
  out[id] = +seconds.toFixed(3);
}
writeFileSync("src/audio-durations.json", JSON.stringify(out, null, 2) + "\n");
console.log(`${Object.keys(out).length} of ${Object.keys(narration).length} clips measured`);
