import { lazy } from "react";
import type * as React from "react";
import type { GamePlugin, HintTarget } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { ShortStackCashState, ShortStackCashAction, ShortStackCashSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
const ShortStackCashGame = /* @__PURE__ */ lazy(() => import("./Game.js").then((mod) => ({ default: mod.ShortStackCashGame as unknown as React.ComponentType<unknown> })));
const settings = { dummy: { kind:"boolean" as const, label:"dummy", default:false } } as const;
type S = SettingsOf<typeof settings>;
export const shortStackCashPlugin: GamePlugin<ShortStackCashState, ShortStackCashAction, typeof settings> = {
  id:"short-stack-cash", title:"Short Stack Cash Solo", category:"cards",
  players:{ min:1, max:1, multiplayer:false },
  description:"Solo short-stack poker; push-fold heavy with capped stacks.",
  howToPlay:"Short Stack Cash Solo simulates capped 20-40 big blind cash games where push-fold strategy dominates and stack-to-pot ratios stay short. Press Deal each round to receive seven cards (two hole + five board) and the engine grades the best five-card poker hand from your draw across all 21 possible combinations.\n\nHand values: High Card 0, Pair 10, Two Pair 30, Three of a Kind 50, Straight 70, Flush 80, Full House 100, Four of a Kind 150, Straight Flush 200. Eight rounds reflect short-stack pace.\n\nShort-stack play forces decisions early: pre-flop equity dominates because there is little post-flop maneuvering room. Pocket pairs and broadway hands gain in value because shoving is correct so often, and implied odds collapse when nobody can raise post-flop. Here each deal mimics a short-stack all-in-or-fold spot. Press Next to push through eight rounds and stack up the highest aggregate!",
  settings,
  initialState:(seed:number,s:S)=>initialState(seed,s as ShortStackCashSettings),
  reducer, isTerminal,   hint: (state: ShortStackCashState): HintTarget | null => {
    if (isTerminal(state)) return null;
    if (state.phase === "deal") return { selector: '[data-testid="hint-target-short-stack-cash-deal"]', pulses: 3 };
    if (state.phase === "scored") return { selector: '[data-testid="hint-target-short-stack-cash-next"]', pulses: 3 };
    return null;
  },
  component:ShortStackCashGame,
};
