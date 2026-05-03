import { lazy } from "react";
import type * as React from "react";
import type { GamePlugin, HintTarget } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { NinjaWallMiniState, NinjaWallMiniAction, NinjaWallMiniSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
const NinjaWallMiniGame = /* @__PURE__ */ lazy(() => import("./Game.js").then((mod) => ({ default: mod.NinjaWallMiniGame as unknown as React.ComponentType<unknown> })));
const settings = { dummy: { kind:"boolean" as const, label:"dummy", default:false } } as const;
type S = SettingsOf<typeof settings>;
export const ninjaWallMiniPlugin: GamePlugin<NinjaWallMiniState, NinjaWallMiniAction, typeof settings> = {
  id:"ninja-wall-mini", title:"Ninja Wall Mini", category:"arcade",
  players:{ min:1, max:1, multiplayer:false },
  description:"Tap ninjas wall-jumping between vertical walls.",
  howToPlay:"Ninja Wall Mini is a thirty-second reflex sprint where ninjas wall-jump between six vertical walls — your job is to tap each ninja before they vanish behind the wall. Each successful tap scores ten points; missed ninjas age out and count against your accuracy. The walls tick roughly once per second, with one or two fresh ninjas spawning per tick. Each ninja only clings to the wall for a few ticks before leaping out of view. The timer counts down from thirty seconds in the upper-right corner. With its bold red-on-red aesthetic, Ninja Wall Mini is pure reflex hunting — quick eyes, faster taps. Average runs net 220-300 points; shuriken-quick ninja-spotters routinely score 380+. Empty-space taps are free of any penalty, so aggressive multi-tap attacks are welcome when several ninjas appear at once. When the timer hits zero, the walls go still and your final score is locked in!",
  settings,
  initialState:(seed:number,s:S)=>initialState(seed,s as NinjaWallMiniSettings),
  reducer,isTerminal,hint: (state: NinjaWallMiniState): HintTarget | null => state.phase === "playing" ? { selector: '[data-testid="hint-target-ninja-wall-mini-primary"]', pulses: 3 } : null,component:NinjaWallMiniGame,
};
