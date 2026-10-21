"""Pitch variation of speech clips, a rough measure of how monotonic a voice sounds.

For each WAV: median F0, spread in semitones (standard deviation, and the 5th to 95th
percentile range) over voiced frames. Usage: python scripts/pitch_stats.py a.wav b.wav ...
"""
import sys
import wave

import librosa
import numpy as np


def load(path):
    with wave.open(path, "rb") as w:
        rate = w.getframerate()
        x = np.frombuffer(w.readframes(w.getnframes()), dtype=np.int16).astype(np.float32) / 32768
    return librosa.resample(x, orig_sr=rate, target_sr=16000), 16000


for path in sys.argv[1:]:
    y, sr = load(path)
    f0, voiced, _ = librosa.pyin(y, fmin=60, fmax=400, sr=sr, frame_length=1024)
    f = f0[voiced & ~np.isnan(f0)]
    st = 12 * np.log2(f / np.median(f))
    lo, hi = np.percentile(st, [5, 95])
    print(f"{path.replace(chr(92), '/').split('/')[-1]:32} median {np.median(f):5.0f} Hz  "
          f"spread {st.std():4.2f} st  range {hi - lo:4.1f} st")
