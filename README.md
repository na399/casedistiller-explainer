# CaseDistiller explainer video

A 3-minute, captions-only explainer for the CaseDistiller manuscript (`../casedistiller-manuscript`), built with Remotion in the Plain Figure design system (UNC theme), 1920 × 1080 at 30 fps.

- `src/theme.ts`: Plain Figure UNC tokens and type scale (scenes are laid out on the 1280 × 720 slide grid and scaled up)
- `src/data.ts`: numbers from the Results Atlas SUMMARY block and the manuscript; ACT macro values are computed
- `src/components/ui.tsx`: Slide, Tab, Kicker, Em highlighter, Panel (superellipse), Bar, Count
- `src/scenes/`: Intro (cover → masked phrases), Method (learner, scorecard, agents), Results (EMS, ACT, per phenotype, review, close)
- `src/Video.tsx`: scene order; each scene's length is the larger of its build minimum and its narration estimate
- `src/narration.json`: the narration, one entry per scene; `node scripts/export-script.mjs` writes `narration/script.md` and `script.json` with timings for TTS
- `public/audio/<SceneId>.wav`: voice clips, one per scene, synthesised by `scripts/tts.mjs` (Drama-3 through the Bifrost gateway, cloning `narration/voice/reference.wav`). Run `node scripts/audio-durations.mjs` afterwards; each scene is then timed to its clip.
- `narration/voice/performance.json`: the spoken script with bracketed delivery directions and pauses (`[upbeat]`, `[short pause]`). Its words must match `src/narration.json`; `tts.mjs` refuses to run if they drift.
- `scripts/asr_check.py`: optional speech-to-text check (faster-whisper). Set `ASR_PYTHON` to a Python with `faster-whisper` and `num2words` and `tts.mjs` rejects takes with missing or extra words.

```
$env:ASR_PYTHON = "<python with faster-whisper>"
node scripts/tts.mjs --env ..\.env        # synthesise, check, retry, assemble
node scripts/audio-durations.mjs          # time scenes to the clips
node scripts/export-script.mjs            # refresh narration/script.md
```

```
npm i
npm run studio      # preview; each scene is also its own composition (Scene-<id>)
npm run render      # out/casedistiller-explainer.mp4
```
