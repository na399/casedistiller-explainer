import React from "react";
import { Composition } from "remotion";
import { SCENES, TOTAL, Video } from "./Video";

export const RemotionRoot: React.FC = () => (
  <>
    <Composition id="CaseDistillerExplainer" component={Video} durationInFrames={TOTAL} fps={30} width={1920} height={1080} />
    {SCENES.map(({ id, frames, C }) => (
      <Composition key={id} id={`Scene-${id}`} component={C} durationInFrames={frames} fps={30} width={1920} height={1080} />
    ))}
  </>
);
