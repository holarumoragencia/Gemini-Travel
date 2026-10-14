import React from "react";
import { Composition } from "remotion";
import { FPS, H, W } from "./brand";
import { ReelChina, TOTAL } from "./ReelChina";

export const Root: React.FC = () => (
  <Composition id="ReelChina" component={ReelChina} durationInFrames={TOTAL} fps={FPS} width={W} height={H} />
);
