import { lazy } from "react";
import type * as React from "react";
import type { GamePlugin, HintTarget } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { TowerStackerMiniState, TowerStackerMiniAction, TowerStackerMiniSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
const TowerStackerMiniGame = /* @__PURE__ */ lazy(() => import("./Game.js").then((mod) => ({ default: mod.TowerStackerMiniGame as unknown as React.ComponentType<unknown> })));
const settings = { dummy: { kind:"boolean" as const, label:"dummy", default:false } } as const;
type S = SettingsOf<typeof settings>;
export const towerStackerMiniPlugin: GamePlugin<TowerStackerMiniState, TowerStackerMiniAction, typeof settings> = {
  id:"tower-stacker-mini", title:"Tower Stacker Mini", category:"arcade",
  players:{ min:1, max:1, multiplayer:false },
  description:"Tap stacking blocks before they tumble away.",
  howToPlay:"Tower Stacker Mini is a thirty-second reflex sprint where stacking blocks appear across six tower lanes — tap each block before it tumbles off the screen to score ten points. Missed blocks age out and count against your accuracy. The towers tick about once per second, spawning one or two fresh blocks each tick. Each block only stays balanced for a few ticks before tumbling. The timer counts down from thirty seconds in the upper-right corner. With its warm wooden block aesthetic, Tower Stacker Mini channels the satisfying clack of physical building blocks while testing pure reflex. Average runs net 220-300 points; tower architects with quick fingers regularly score 380+. Empty-space taps are free of penalty, so attack the towers aggressively when many blocks appear at once. When the timer hits zero, the towers go still and your final score is locked in. Stack 'em high, tap 'em fast!",
  settings,
  initialState:(seed:number,s:S)=>initialState(seed,s as TowerStackerMiniSettings),
  reducer,isTerminal,hint: (state: TowerStackerMiniState): HintTarget | null => state.phase === "playing" ? { selector: '[data-testid="hint-target-tower-stacker-mini-primary"]', pulses: 3 } : null,component:TowerStackerMiniGame,
};
