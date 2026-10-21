import React from "react";
import { Audio, Sequence, Series, staticFile } from "remotion";
import { Approach, Cover, Expansion, Masked, Routes } from "./scenes/Intro";
import { Compare, Tasks } from "./scenes/Compare";
import { AgentEdit, AgentLoop, Candidates, Foil, Scorecard, Selection } from "./scenes/Method";
import { Act, Close, Ems, Execution, Split } from "./scenes/Results";
import NARRATION from "./narration.json";
import { CLIPS, FPS, leadSeconds, sceneSeconds } from "./timing";

export { FPS };
export const AUDIO = Object.keys(CLIPS).length > 0;

// Hook → approach → mechanism (inventory, FOIL growth, selection, scorecard, refinement)
// → tasks → evidence → execution → close.
// minFrames keeps every build inside the scene (paced by SLOW in components/ui.tsx, or by
// sentence cues for Foil); the measured clip plus lead-in and tail extends it when longer.
// Keep this table in step with MIN in scripts/export-script.mjs.
const ORDER: { id: keyof typeof NARRATION; minFrames: number; C: React.FC }[] = [
  { id: "Cover", minFrames: 330, C: Cover },
  { id: "Compare", minFrames: 720, C: Compare },
  { id: "Approach", minFrames: 480, C: Approach },
  { id: "Routes", minFrames: 420, C: Routes },
  { id: "Expansion", minFrames: 390, C: Expansion },
  { id: "Masked", minFrames: 420, C: Masked },
  { id: "Candidates", minFrames: 540, C: Candidates },
  { id: "Foil", minFrames: 1500, C: Foil },
  { id: "Selection", minFrames: 630, C: Selection },
  { id: "Scorecard", minFrames: 600, C: Scorecard },
  { id: "AgentLoop", minFrames: 630, C: AgentLoop },
  { id: "AgentEdit", minFrames: 480, C: AgentEdit },
  { id: "Tasks", minFrames: 600, C: Tasks },
  { id: "Ems", minFrames: 540, C: Ems },
  { id: "Act", minFrames: 630, C: Act },
  { id: "Split", minFrames: 450, C: Split },
  { id: "Execution", minFrames: 540, C: Execution },
  { id: "Close", minFrames: 300, C: Close },
];

export const SCENES = ORDER.map((sc) => ({
  ...sc,
  narration: NARRATION[sc.id],
  frames: Math.max(sc.minFrames, Math.ceil(sceneSeconds(sc.id) * FPS)),
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
