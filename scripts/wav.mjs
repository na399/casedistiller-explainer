// Minimal 16-bit PCM WAV helpers: read, analyse speech extent, trim, join, write.
import { readFileSync, writeFileSync } from "node:fs";

export function readWav(input) {
  const b = Buffer.isBuffer(input) ? input : readFileSync(input);
  let off = 12, rate = 44100, channels = 1, data;
  while (off < b.length - 8) {
    const id = b.toString("ascii", off, off + 4), size = b.readUInt32LE(off + 4);
    if (id === "fmt ") { channels = b.readUInt16LE(off + 10); rate = b.readUInt32LE(off + 12); }
    if (id === "data") { data = b.subarray(off + 8, off + 8 + Math.min(size, b.length - off - 8)); break; }
    off += 8 + size + (size % 2);
  }
  if (!data) throw new Error("no data chunk");
  if (channels !== 1) throw new Error(`expected mono, got ${channels} channels`);
  const samples = new Int16Array(data.length >> 1);
  for (let i = 0; i < samples.length; i++) samples[i] = data.readInt16LE(i * 2);
  return { rate, samples };
}

// Speech extent from 50 ms RMS windows above a -40 dBFS gate.
export function analyse({ rate, samples }) {
  const win = Math.round(rate * 0.05), loud = [];
  for (let i = 0; i < samples.length; i += win) {
    let w = 0;
    const end = Math.min(samples.length, i + win);
    for (let j = i; j < end; j++) { const v = samples[j] / 32768; w += v * v; }
    loud.push(Math.sqrt(w / (end - i)) > 0.01);
  }
  const first = loud.indexOf(true), last = loud.lastIndexOf(true);
  let gap = 0, run = 0;
  for (let k = first; k <= last; k++) { run = loud[k] ? 0 : run + 1; gap = Math.max(gap, run); }
  return {
    seconds: samples.length / rate,
    start: first < 0 ? 0 : first * 0.05,
    end: last < 0 ? 0 : (last + 1) * 0.05,
    longestPause: gap * 0.05,
  };
}

export function trim(wav, padSeconds = 0.05) {
  const a = analyse(wav);
  const s = Math.max(0, Math.floor((a.start - padSeconds) * wav.rate));
  const e = Math.min(wav.samples.length, Math.ceil((a.end + padSeconds) * wav.rate));
  return { rate: wav.rate, samples: wav.samples.subarray(s, e) };
}

export function join(parts, gapSeconds) {
  const rate = parts[0].rate, gap = Math.round(gapSeconds * rate);
  const total = parts.reduce((n, p) => n + p.samples.length, 0) + gap * (parts.length - 1);
  const out = new Int16Array(total);
  let pos = 0;
  parts.forEach((p, i) => { out.set(p.samples, pos); pos += p.samples.length + (i < parts.length - 1 ? gap : 0); });
  return { rate, samples: out };
}

// Shortens every internal silence longer than maxSeconds to maxSeconds, keeping its edges.
export function capPauses({ rate, samples }, maxSeconds = 1.1) {
  const win = Math.round(rate * 0.05), loud = [];
  for (let i = 0; i < samples.length; i += win) {
    let w = 0;
    const end = Math.min(samples.length, i + win);
    for (let j = i; j < end; j++) { const v = samples[j] / 32768; w += v * v; }
    loud.push(Math.sqrt(w / (end - i)) > 0.01);
  }
  const keep = Math.round(maxSeconds / 0.05), cut = [];
  for (let k = 0; k < loud.length; ) {
    if (loud[k]) { k++; continue; }
    let e = k;
    while (e < loud.length && !loud[e]) e++;
    if (k > 0 && e < loud.length && e - k > keep) cut.push([k + Math.floor(keep / 2), e - Math.ceil(keep / 2)]);
    k = e;
  }
  if (!cut.length) return { rate, samples };
  const pieces = [];
  let pos = 0;
  for (const [a, b] of cut) { pieces.push(samples.subarray(pos, a * win)); pos = b * win; }
  pieces.push(samples.subarray(pos));
  const out = new Int16Array(pieces.reduce((n, p) => n + p.length, 0));
  let o = 0;
  for (const p of pieces) { out.set(p, o); o += p.length; }
  return { rate, samples: out };
}

// Scales speech to a target RMS (measured over loud windows only), never past the peak ceiling.
export function normalize({ rate, samples }, targetDb = -20, peakDb = -1) {
  const win = Math.round(rate * 0.05);
  let sum = 0, n = 0, peak = 1;
  for (let i = 0; i < samples.length; i += win) {
    let w = 0;
    const end = Math.min(samples.length, i + win);
    for (let j = i; j < end; j++) { const v = samples[j] / 32768; w += v * v; peak = Math.max(peak, Math.abs(samples[j])); }
    if (Math.sqrt(w / (end - i)) > 0.01) { sum += w; n += end - i; }
  }
  if (!n) return { rate, samples };
  const gain = Math.min(10 ** (targetDb / 20) / Math.sqrt(sum / n), (10 ** (peakDb / 20) * 32767) / peak);
  const out = new Int16Array(samples.length);
  for (let i = 0; i < samples.length; i++) out[i] = Math.max(-32768, Math.min(32767, Math.round(samples[i] * gain)));
  return { rate, samples: out };
}

export function writeWav(path, { rate, samples }) {
  const h = Buffer.alloc(44);
  h.write("RIFF", 0); h.writeUInt32LE(36 + samples.length * 2, 4); h.write("WAVE", 8);
  h.write("fmt ", 12); h.writeUInt32LE(16, 16); h.writeUInt16LE(1, 20); h.writeUInt16LE(1, 22);
  h.writeUInt32LE(rate, 24); h.writeUInt32LE(rate * 2, 28); h.writeUInt16LE(2, 32); h.writeUInt16LE(16, 34);
  h.write("data", 36); h.writeUInt32LE(samples.length * 2, 40);
  writeFileSync(path, Buffer.concat([h, Buffer.from(samples.buffer, samples.byteOffset, samples.length * 2)]));
}
