// Prints duration, peak, RMS and the longest internal silence of 16-bit mono WAV clips.
// Usage: node scripts/wav-stats.mjs public/audio/*.wav
import { readFileSync } from "node:fs";

for (const path of process.argv.slice(2)) {
  const b = readFileSync(path);
  let off = 12, rate = 44100, data;
  while (off < b.length - 8) {
    const id = b.toString("ascii", off, off + 4), size = b.readUInt32LE(off + 4);
    if (id === "fmt ") rate = b.readUInt32LE(off + 12);
    if (id === "data") { data = b.subarray(off + 8, off + 8 + Math.min(size, b.length - off - 8)); break; }
    off += 8 + size + (size % 2);
  }
  const n = data.length >> 1, win = Math.round(rate * 0.05);
  let peak = 0, sum = 0;
  const loud = [];
  for (let i = 0; i < n; i += win) {
    let w = 0;
    for (let j = i; j < Math.min(n, i + win); j++) {
      const v = data.readInt16LE(j * 2) / 32768;
      peak = Math.max(peak, Math.abs(v)); sum += v * v; w += v * v;
    }
    loud.push(Math.sqrt(w / win) > 0.01);
  }
  const first = loud.indexOf(true), last = loud.lastIndexOf(true);
  let gap = 0, run = 0;
  for (let k = first; k <= last; k++) { run = loud[k] ? 0 : run + 1; gap = Math.max(gap, run); }
  const db = (x) => (20 * Math.log10(x)).toFixed(1);
  console.log(
    `${path.split(/[\\/]/).pop()}: ${(n / rate).toFixed(2)} s, speech ${(first * 0.05).toFixed(2)}–${((last + 1) * 0.05).toFixed(2)} s, ` +
      `peak ${db(peak)} dBFS, rms ${db(Math.sqrt(sum / n))} dBFS, longest pause ${(gap * 0.05).toFixed(2)} s`,
  );
}
