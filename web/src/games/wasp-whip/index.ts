import { lazy } from "react";
import type * as React from "react";
import type { GamePlugin, HintTarget } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { WaspWhipState, WaspWhipAction, WaspWhipSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
const WaspWhipGame = /* @__PURE__ */ lazy(() => import("./Game.js").then((mod) => ({ default: mod.WaspWhipGame as unknown as React.ComponentType<unknown> })));
const settings = { dummy: { kind:"boolean" as const, label:"dummy", default:false } } as const;
type S = SettingsOf<typeof settings>;
export const waspWhipPlugin: GamePlugin<WaspWhipState, WaspWhipAction, typeof settings> = {
  id:"wasp-whip", title:"Wasp Whip", category:"arcade",
  players:{ min:1, max:1, multiplayer:false },
  description:"Click wasps in 25 seconds.",
  howToPlay:"Wasp Whip is a fast 25-second clicker arcade. Wasps dart across the screen in six lanes; tap each one as fast as you can to whip it down for 10 points. Each wasp lingers a few ticks before zipping off — miss too many and your tally suffers.\n\nThe game ticks roughly once per second, spawning fresh wasps in random lanes. The board can quickly fill with stinging targets, so practice your hand-eye coordination — every wasp you whip is 10 points closer to a top score.\n\nThe shorter timer (25 seconds vs the standard 30) demands faster reactions and tighter focus. Average runs land near 180-260 points; sharpshooters pushing 400+ are showing real reflex talent. The clock counts down in the top right; when it hits zero, your final score is locked in. Whip those wasps!",
  settings,
  initialState:(seed:number,s:S)=>initialState(seed,s as WaspWhipSettings),
  reducer,isTerminal,
  hint: (state: WaspWhipState): HintTarget | null => {
    if (state.phase === "done") return null;
    if (!state.bugs || state.bugs.length === 0) return null;
    return { selector: '[data-testid="hint-target-wasp-whip-target"]', pulses: 3 };
  },
  component:WaspWhipGame,
};
