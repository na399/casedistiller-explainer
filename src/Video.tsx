import React from "react";
import { Audio, Sequence, Series, staticFile } from "remotion";
import { Approach, Cover, Expansion, Masked, Routes } from "./scenes/Intro";
import { Compare, Tasks } from "./scenes/Compare";
import { AgentEdit, AgentLoop, Candidates, Scorecard, Selection } from "./scenes/Method";
import { Act, Audit, Close, Ems, Split } from "./scenes/Results";
import NARRATION from "./narration.json";
import AUDIO_DURATIONS from "./audio-durations.json";

export const FPS = 30;

// Narration pacing used to size each scene before real audio exists:
// words per second of a neutral TTS voice, plus a lead-in and a tail of silence.
export const WORDS_PER_SECOND = 2.6;
export const LEAD_SECONDS = 0.8;
export const TAIL_SECONDS = 0.8;

// Measured voice clips (scripts/audio-durations.mjs). A scene with a clip plays it after the
// lead-in and is timed to it; a scene without one falls back to the word-count estimate.
const CLIPS = AUDIO_DURATIONS as Record<string, number>;
export const AUDIO = Object.keys(CLIPS).length > 0;

export const wordCount = (text: string) => text.trim().split(/\s+/).length;
const speechSeconds = (id: string, text: string) => CLIPS[id] ?? wordCount(text) / WORDS_PER_SECOND;
// Per-scene lead-in overrides: the opening waits a beat before the first word.
export const LEAD_OVERRIDES: Record<string, number> = { Cover: 1.8 };
export const leadSeconds = (id: string) => LEAD_OVERRIDES[id] ?? LEAD_SECONDS;
export const narrationSeconds = (id: string, text: string) => speechSeconds(id, text) + leadSeconds(id) + TAIL_SECONDS;

// Hook → approach → mechanism → tasks → evidence → implication.
// minFrames keeps every build inside the scene (paced by SLOW in components/ui.tsx); the
// narration estimate extends the scene when the voice needs longer.
const ORDER: { id: keyof typeof NARRATION; minFrames: number; C: React.FC }[] = [
  { id: "Cover", minFrames: 330, C: Cover },
  { id: "Compare", minFrames: 720, C: Compare },
  { id: "Approach", minFrames: 480, C: Approach },
  { id: "Routes", minFrames: 420, C: Routes },
  { id: "Expansion", minFrames: 390, C: Expansion },
  { id: "Masked", minFrames: 420, C: Masked },
  { id: "Candidates", minFrames: 660, C: Candidates },
  { id: "Selection", minFrames: 630, C: Selection },
  { id: "Scorecard", minFrames: 540, C: Scorecard },
  { id: "AgentLoop", minFrames: 630, C: AgentLoop },
  { id: "AgentEdit", minFrames: 630, C: AgentEdit },
  { id: "Tasks", minFrames: 600, C: Tasks },
  { id: "Ems", minFrames: 540, C: Ems },
  { id: "Act", minFrames: 630, C: Act },
  { id: "Split", minFrames: 450, C: Split },
  { id: "Audit", minFrames: 540, C: Audit },
  { id: "Close", minFrames: 300, C: Close },
];

export const SCENES = ORDER.map((sc) => ({
  ...sc,
  narration: NARRATION[sc.id],
  frames: Math.max(sc.minFrames, Math.ceil(narrationSeconds(sc.id, NARRATION[sc.id]) * FPS)),
}));

export const TOTAL = SCENES.reduce((n, x) => n + x.frames, 0);

export const Video: React.FC = () => (
  <Series>
    {SCENES.map(({ id, frames, C }) => (
      <Series.Sequence key={id} durationInFrames={frames} name={id}>
        <C />
        {CLIPS[id] !== undefined && (
          <Sequence from={Math.round(leadSeconds(id) * FPS)} layout="none">
            <Audio src={staticFile(`audio/${id}.wav`)} />
          </Sequence>
        )}
      </Series.Sequence>
    ))}
  </Series>
);
