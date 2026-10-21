# CaseDistiller explainer video

An 18-scene, voiced explainer for the CaseDistiller manuscript (`../casedistiller-manuscript`), built with Remotion in the Plain Figure design system (UNC theme), 1920 × 1080 at 30 fps. The narration is a cloned voice (Fish Audio Drama-3), and each scene is timed to its measured clip, for a total of about seven minutes.

Scene order: Cover, Compare, Approach, Routes, Expansion, Masked, Candidates, Foil, Selection, Scorecard, AgentLoop, AgentEdit, Tasks, Ems, Act, Split, Execution, Close.

## Layout

- `src/theme.ts`: Plain Figure UNC tokens and type scale. Scenes are laid out on the 1280 × 720 slide grid and scaled up.
- `src/data.ts`: result values checked against the revised manuscript (Table 2, Table 4, Figure 2), ACT macro values computed from the per-phenotype rows, and the **synthetic** FOIL illustration (`FOIL_START`, `FOIL_ADDITIONS`) from which every number in the Foil scene is derived.
- `src/components/ui.tsx`: Slide, Tab, Kicker, Em highlighter, Panel (superellipse), Bar, Count. `s(sec)` converts storyboard seconds to frames and includes the `SLOW` pace factor.
- `src/scenes/`: Intro (cover to masked phrases), Compare (approaches, tasks), Method (inventory, FOIL growth, selection, scorecard, refinement), Results (EMS, ACT, per phenotype, execution, close).
- `src/timing.ts`: lead-ins and tails (with per-scene overrides), measured clip lengths, and `sentenceCues(id)`, which places the Foil builds on the sentences of its clip.
- `src/Video.tsx`: scene order and minimum frames. A scene lasts its build minimum or its clip plus lead-in and tail, whichever is longer. Keep `ORDER` in step with `MIN` in `scripts/export-script.mjs`.
- `src/narration.json`: the canonical narration, one entry per scene.
- `narration/voice/performance.json`: the same words with delivery directions (`[measured]`, `[short pause]`). `tts.mjs` refuses to run if its words drift from `src/narration.json`.
- `narration/voice/pronunciations.json`: spoken forms sent to the model only (for example "Case Distiller"). Mapped words must be heard in every take.

## Voice

Clips are synthesised by `scripts/tts.mjs` (Drama-3 through the Bifrost gateway, cloning `narration/voice/reference.wav` with its transcript `reference.txt`). Every take is transcribed by `scripts/asr_check.py` (faster-whisper) and rejected if words, the ending, or a mapped name are not heard. Voice recordings and clips are git-ignored.

```
$env:ASR_PYTHON = "<python with faster-whisper and num2words>"
node scripts/tts.mjs --env ..\.env --max-pause 1.0   # synthesise, check, retry, assemble
node scripts/verify-audio.mjs                        # re-check the final clips
node scripts/audio-durations.mjs                     # time scenes to the clips
node scripts/export-script.mjs                       # refresh narration/script.md and script.json
```

Move or delete stale clips from `public/audio/` when narration changes: playback attaches any clip whose scene id is present.

## Preview and render

```
npm i
npm run studio      # preview; each scene is also its own composition (Scene-<id>), without audio
npm run render      # out/casedistiller-explainer.mp4, with audio
```
