"""Speech-to-text check for synthesised narration clips.

Runs as a worker: reads one JSON object per stdin line, {"path": ..., "text": ...}, and
writes one JSON line back with the transcript, the share of expected words heard in order
(coverage), the share of extra heard words (extra) and the expected words that were missed.
Needs faster-whisper and num2words. Usage: python scripts/asr_check.py [model]
"""
import json
import re
import sys
import wave

import numpy as np
from faster_whisper import WhisperModel
from num2words import num2words

ONES = "zero one two three four five six seven eight nine".split()


def spell(token):
    if re.fullmatch(r"\d+\.\d+", token):
        whole, frac = token.split(".")
        return f"{num2words(int(whole))} point {' '.join(ONES[int(d)] for d in frac)}"
    if re.fullmatch(r"\d+", token):
        return num2words(int(token))
    return token


def norm(text):
    text = re.sub(r"\[[^\]]*\]", " ", text)
    text = re.sub(r"</?[a-z]+>", " ", text)
    text = re.sub(r"(?<=\d),(?=\d{3})", "", text)
    text = re.sub(r"\d+(?:\.\d+)?", lambda m: f" {spell(m.group(0))} ", text)
    text = text.lower().replace("’", "'")
    # The product name in any spelling ("CaseDistiller", "case-distiller", "case distiller").
    text = re.sub(r"\bcase[\s-]*distiller\b", "casedistiller", text)
    text = text.replace("-", " ")
    # Spelled initialisms ("S.T.", "s t") count as one token ("st").
    text = re.sub(r"\b(?:[a-z]\.\s*){2,}", lambda m: re.sub(r"[.\s]", "", m.group(0)) + " ", text)
    text = re.sub(r"\b([a-z]) (?=[a-z]\b)", r"\1", text)
    tokens = re.findall(r"[a-z0-9']+", re.sub(r"\band\b", " ", text))
    return [fold(t) for t in tokens]


# Pronunciation variants the recogniser writes differently ("route" said as "root").
VARIANTS = {"root": "route", "roots": "route", "light": "lite", "node": "note"}


def fold(token):
    token = VARIANTS.get(token, token)
    return token[:-1] if len(token) > 3 and token.endswith("s") and not token.endswith("ss") else token


def lcs_matched(a, b):
    """Indices of a matched in order by a longest common subsequence with b."""
    m, n = len(a), len(b)
    dp = [[0] * (n + 1) for _ in range(m + 1)]
    for i in range(m - 1, -1, -1):
        for j in range(n - 1, -1, -1):
            dp[i][j] = dp[i + 1][j + 1] + 1 if a[i] == b[j] else max(dp[i + 1][j], dp[i][j + 1])
    i = j = 0
    hit = set()
    while i < m and j < n:
        if a[i] == b[j]:
            hit.add(i)
            i += 1
            j += 1
        elif dp[i + 1][j] >= dp[i][j + 1]:
            i += 1
        else:
            j += 1
    return hit


def read_audio(path):
    """16-bit PCM WAV to 16 kHz mono float32, without PyAV."""
    with wave.open(path, "rb") as w:
        rate, channels = w.getframerate(), w.getnchannels()
        x = np.frombuffer(w.readframes(w.getnframes()), dtype=np.int16).astype(np.float32) / 32768
    if channels > 1:
        x = x.reshape(-1, channels).mean(axis=1)
    n = int(len(x) * 16000 / rate)
    return np.interp(np.arange(n) * rate / 16000, np.arange(len(x)), x).astype(np.float32)


def load(name):
    try:
        return WhisperModel(name, device="cuda", compute_type="float16")
    except Exception:
        return WhisperModel(name, device="cpu", compute_type="int8")


def main():
    model = load(sys.argv[1] if len(sys.argv) > 1 else "small.en")
    print(json.dumps({"ready": True}), flush=True)
    for line in sys.stdin:
        if not line.strip():
            continue
        job = json.loads(line.lstrip("﻿"))
        try:
            segments, _ = model.transcribe(read_audio(job["path"]), language="en", beam_size=5, vad_filter=False)
            heard = " ".join(s.text.strip() for s in segments)
        except Exception as e:  # report and keep serving
            print(json.dumps({"error": str(e)}), flush=True)
            continue
        want, got = norm(job["text"]), norm(heard)
        hit = lcs_matched(want, got)
        print(json.dumps({
            "transcript": heard,
            "coverage": len(hit) / max(1, len(want)),
            "extra": (len(got) - len(hit)) / max(1, len(want)),
            "missing": [w for k, w in enumerate(want) if k not in hit],
            # The ending matters most: a cut-off or garbled last phrase is the costliest error.
            "tail_ok": all(k in hit for k in range(max(0, len(want) - 3), len(want))),
        }), flush=True)


if __name__ == "__main__":
    main()
