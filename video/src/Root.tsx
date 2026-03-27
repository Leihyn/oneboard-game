import { Composition } from "remotion";
import { OneBoardDemo } from "./OneBoardDemo";
import { FPS, W, H, TOTAL_FRAMES } from "./constants";

export const RemotionRoot: React.FC = () => (
  <Composition
    id="OneBoardDemo"
    component={OneBoardDemo}
    durationInFrames={TOTAL_FRAMES}
    fps={FPS}
    width={W}
    height={H}
  />
);
