import { lazy } from "react";
import type * as React from "react";
import type { GamePlugin, HintTarget } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { HoldemSpreadLimitState, HoldemSpreadLimitAction, HoldemSpreadLimitSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
const HoldemSpreadLimitGame = /* @__PURE__ */ lazy(() => import("./Game.js").then((mod) => ({ default: mod.HoldemSpreadLimitGame as unknown as React.ComponentType<unknown> })));
const settings = { dummy: { kind:"boolean" as const, label:"dummy", default:false } } as const;
type S = SettingsOf<typeof settings>;
export const holdemSpreadLimitPlugin: GamePlugin<HoldemSpreadLimitState, HoldemSpreadLimitAction, typeof settings> = {
  id:"holdem-spread-limit", title:"Hold'em Spread-Limit Solo", category:"cards",
  players:{ min:1, max:1, multiplayer:false },
  description:"Spread-Limit Hold'em solo: seven cards per round, best five-card poker hand scored.",
  howToPlay:"Hold'em Spread-Limit Solo gives you the rhythm of Spread-Limit Hold'em — bets fall within a defined range — translated into a seeded solo dealer game. Press Deal each round to receive seven cards (two hole + five board); the best five-card poker hand is rated automatically.\n\nHand scoring: High Card 0, Pair 10, Two Pair 30, Three of a Kind 50, Straight 70, Flush 80, Full House 100, Four of a Kind 150, Straight Flush 200.\n\nThe Spread-Limit structure in live play allows wider bet ranges than Fixed-Limit but tighter than No-Limit, producing balanced action. The analog here is balanced variance — strong hands appear about as often as in any seven-card variant, and your eight-round score should hover around two pair to trips average.\n\nPress Next between rounds. Try multiple seeds to compare your mid-range consistency!",
  settings,
  initialState:(seed:number,s:S)=>initialState(seed,s as HoldemSpreadLimitSettings),
  reducer, isTerminal,   hint: (state: HoldemSpreadLimitState): HintTarget | null => {
    if (isTerminal(state)) return null;
    if (state.phase === "deal") return { selector: '[data-testid="hint-target-holdem-spread-limit-deal"]', pulses: 3 };
    if (state.phase === "scored") return { selector: '[data-testid="hint-target-holdem-spread-limit-next"]', pulses: 3 };
    return null;
  },
  component:HoldemSpreadLimitGame,
};
