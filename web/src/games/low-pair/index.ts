import { lazy } from "react";
import type * as React from "react";
import type { GamePlugin } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { LowPairState, LowPairAction, LowPairSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
const LowPairGame = /* @__PURE__ */ lazy(() => import("./Game.js").then((mod) => ({ default: mod.LowPairGame as unknown as React.ComponentType<unknown> })));
const settings = { dummy: { kind:"boolean" as const, label:"dummy", default:false } } as const;
type S = SettingsOf<typeof settings>;
export const lowPairPlugin: GamePlugin<LowPairState, LowPairAction, typeof settings> = {
  id:"low-pair", title:"Low Pair", category:"cards",
  players:{ min:1, max:1, multiplayer:false },
  description:"Two cards per round. Pair? Score (14 - rank). Lower pairs score the most. 8 rounds.",
  howToPlay:`Low Pair is a quick card mini designed around the rare gift of a low matched pair. Each round you deal two cards; if they share the same rank, you score points equal to 14 minus the rank. So a pair of 2s is worth 12 points, threes worth 11, fours worth 10, all the way down to a pair of Aces worth 0.

If your two cards do not share a rank, you score nothing for that round. There are 8 rounds in a game; the deck refreshes between rounds, so each deal is independent.

The probability of being dealt any pair from two cards is roughly 1 in 17. Most rounds you'll come up empty — but when fortune favors a low pair, the points pile up fast. A perfect game (eight pairs of twos) would total 96 points, but a single deuce-pair anywhere is already a win to celebrate.

Press Deal to flip your cards, then Next to advance. Average scores cluster near 0-12 points, so any non-zero finish is great.`,
  settings,
  initialState:(seed:number,s:S)=>initialState(seed,s as LowPairSettings),
  reducer,isTerminal,hint: (state) => isTerminal(state) ? null : ({ selector: '[data-testid="hint-target-low-pair-primary"]', pulses: 3 }),component:LowPairGame,
};
