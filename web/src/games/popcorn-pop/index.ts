import { lazy } from "react";
import type * as React from "react";
import type { GamePlugin, HintTarget } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { PopcornPopState, PopcornPopAction, PopcornPopSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
const PopcornPopGame = /* @__PURE__ */ lazy(() => import("./Game.js").then((mod) => ({ default: mod.PopcornPopGame as unknown as React.ComponentType<unknown> })));
const settings = { dummy: { kind:"boolean" as const, label:"dummy", default:false } } as const;
type S = SettingsOf<typeof settings>;
export const popcornPopPlugin: GamePlugin<PopcornPopState, PopcornPopAction, typeof settings> = {
  id:"popcorn-pop", title:"Popcorn Pop", category:"arcade",
  players:{ min:1, max:1, multiplayer:false },
  description:"Tap popcorn kernels as they pop. 30-second clicker.",
  howToPlay:"Popcorn Pop is a buttery 30-second snack clicker. Popcorn kernels appear in six lanes; tap each one as fast as you can to pop it for 10 points. Each kernel hangs around for a few ticks before drifting off — miss too many and your final tally suffers.\n\nThe game ticks roughly once per second, spawning fresh kernels in random lanes. The board fills with golden buttery targets, so practice your hand-eye coordination — every pop is 10 points closer to a top score.\n\nThere's no skill ceiling: the more kernels you tap in 30 seconds, the higher your score. Average runs land near 200-300 points; sharpshooters pushing 500+ are showing real reflex talent. The clock counts down in the top right; when it hits zero, your final score is locked in.\n\nMash that screen and pop that corn!",
  settings,
  initialState:(seed:number,s:S)=>initialState(seed,s as PopcornPopSettings),
  reducer,isTerminal,
  hint: (state: PopcornPopState): HintTarget | null => {
    if (state.phase === "done") return null;
    if (!state.targets || state.targets.length === 0) return null;
    return { selector: '[data-testid="hint-target-popcorn-pop-target"]', pulses: 3 };
  },
  component:PopcornPopGame,
};
