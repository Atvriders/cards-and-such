import { lazy } from "react";
import type * as React from "react";
import type { GamePlugin } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { TrainTapState, TrainTapAction, TrainTapSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
const TrainTapGame = /* @__PURE__ */ lazy(() => import("./Game.js").then((mod) => ({ default: mod.TrainTapGame as unknown as React.ComponentType<unknown> })));
const settings = { dummy: { kind:"boolean" as const, label:"dummy", default:false } } as const;
type S = SettingsOf<typeof settings>;
export const trainTapPlugin: GamePlugin<TrainTapState, TrainTapAction, typeof settings> = {
  id:"train-tap", title:"Train Tap", category:"arcade",
  players:{ min:1, max:1, multiplayer:false },
  description:"Click trains chugging past. 25-second clicker.",
  howToPlay:`Train Tap is a 25-second arcade clicker featuring trains chugging across six lanes of track. Tap each train as fast as you can to score 10 points per tap. Each train stays on screen for a few ticks before rolling out of frame — miss too many and your score takes a hit.

The game ticks about once per second, spawning fresh trains in random lanes. The tracks fill with locomotives, so reflexes and aim matter — every train you tap is 10 points closer to a top score.

There's no skill ceiling: the more trains you tap in 25 seconds, the higher you score. Because this game is shorter than other vehicle clickers, expected averages are near 170-250 points, with elite scores breaking 400. The clock counts down in the top right; when it hits zero, your final score is locked in.

All aboard!`,
  settings,
  initialState:(seed:number,s:S)=>initialState(seed,s as TrainTapSettings),
  reducer,isTerminal,
  hint: (state: TrainTapState) => {
    if (state.phase === "done") return null;
    if (!state.targets || state.targets.length === 0) return null;
    return { selector: ".trt-target", pulses: 3 };
  },
  component:TrainTapGame,
};
