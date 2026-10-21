// Shared timing: lead-ins, tails, measured clip lengths, and sentence cues for scenes whose
// builds follow the narration (Foil). Video.tsx and the scenes both import from here.
import NARRATION from "./narration.json";
import AUDIO_DURATIONS from "./audio-durations.json";

export const FPS = 30;
// Used only for a scene with no measured clip yet.
export const WORDS_PER_SECOND = 2.1;
export const LEAD_SECONDS = 0.8;
export const TAIL_SECONDS = 0.8;
// The opening waits a beat before the first word; Foil holds its final state to be read.
export const LEAD_OVERRIDES: Record<string, number> = { Cover: 1.8 };
export const TAIL_OVERRIDES: Record<string, number> = { Foil: 3.0 };

export const CLIPS = AUDIO_DURATIONS as Record<string, number>;
const TEXT = NARRATION as Record<string, string>;

export const wordCount = (text: string) => text.trim().split(/\s+/).length;
export const leadSeconds = (id: string) => LEAD_OVERRIDES[id] ?? LEAD_SECONDS;
export const tailSeconds = (id: string) => TAIL_OVERRIDES[id] ?? TAIL_SECONDS;
export const speechSeconds = (id: string) => CLIPS[id] ?? wordCount(TEXT[id] ?? "") / WORDS_PER_SECOND;
export const sceneSeconds = (id: string) => leadSeconds(id) + speechSeconds(id) + tailSeconds(id);

// Frame at which each narration sentence starts, spreading the measured clip over the
// sentences by word count. Good to about a second, which is enough to land a build on the
// sentence that introduces it.
export const sentenceCues = (id: string): number[] => {
  const sentences = (TEXT[id] ?? "").match(/[^.!?]+[.!?]+/g) ?? [];
  const words = sentences.map(wordCount);
  const total = words.reduce((a, b) => a + b, 0) || 1;
  const speech = speechSeconds(id);
  let acc = 0;
  return words.map((w) => {
    const at = Math.round((leadSeconds(id) + (acc / total) * speech) * FPS);
    acc += w;
    return at;
  });
};
