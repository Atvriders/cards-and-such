import { lazy } from "react";
import type * as React from "react";
import type { GamePlugin, HintTarget } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { LaneDefenderMiniState, LaneDefenderMiniAction, LaneDefenderMiniSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
const LaneDefenderMiniGame = /* @__PURE__ */ lazy(() => import("./Game.js").then((mod) => ({ default: mod.LaneDefenderMiniGame as unknown as React.ComponentType<unknown> })));
const settings = { dummy: { kind:"boolean" as const, label:"dummy", default:false } } as const;
type S = SettingsOf<typeof settings>;
export const laneDefenderMiniPlugin: GamePlugin<LaneDefenderMiniState, LaneDefenderMiniAction, typeof settings> = {
  id:"lane-defender-mini", title:"Lane Defender Mini", category:"arcade",
  players:{ min:1, max:1, multiplayer:false },
  description:"Tap incoming aliens in single-lane defense.",
  howToPlay:"Lane Defender Mini is a thirty-second alien-defense reflex sprint where invading aliens descend through six defensive lanes — tap each alien before it slips past your defenses to score ten points. Missed aliens age out and count against your accuracy. The defense grid ticks about once per second, spawning one or two fresh aliens per tick. Each alien only descends for a few ticks before reaching your base. The timer counts down from thirty seconds in the upper-right corner. With its dark green-on-black retro arcade aesthetic, Lane Defender Mini channels the spirit of single-lane wave defenders. Average runs net 220-300 points; defense-grid veterans with quick fingers routinely score 380+. Empty-space taps are free of penalty, so attack the grid aggressively when multiple aliens appear at once. When the timer hits zero, the grid clears and your final score is locked in. Defend the lanes — stop the invasion!",
  settings,
  initialState:(seed:number,s:S)=>initialState(seed,s as LaneDefenderMiniSettings),
  reducer,isTerminal,hint: (state: LaneDefenderMiniState): HintTarget | null => state.phase === "playing" ? { selector: '[data-testid="hint-target-lane-defender-mini-primary"]', pulses: 3 } : null,component:LaneDefenderMiniGame,
};
