import { lazy } from "react";
import type * as React from "react";
import type { GamePlugin, HintTarget } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { HoldemFixedLimitState, HoldemFixedLimitAction, HoldemFixedLimitSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
const HoldemFixedLimitGame = /* @__PURE__ */ lazy(() => import("./Game.js").then((mod) => ({ default: mod.HoldemFixedLimitGame as unknown as React.ComponentType<unknown> })));
const settings = { dummy: { kind:"boolean" as const, label:"dummy", default:false } } as const;
type S = SettingsOf<typeof settings>;
export const holdemFixedLimitPlugin: GamePlugin<HoldemFixedLimitState, HoldemFixedLimitAction, typeof settings> = {
  id:"holdem-fixed-limit", title:"Hold'em Fixed-Limit Solo", category:"cards",
  players:{ min:1, max:1, multiplayer:false },
  description:"Fixed-Limit Hold'em solo: seven cards dealt each round, best five rated by poker rank.",
  howToPlay:"Hold'em Fixed-Limit Solo is the steady cousin of No-Limit — measured, structured, eight rounds and no surprises in pacing. Each round, press Deal to receive seven random cards (two hole + five community) and the best five-card poker hand is scored automatically.\n\nHand values follow the standard ranking: High Card 0, Pair 10, Two Pair 30, Three of a Kind 50, Straight 70, Flush 80, Full House 100, Four of a Kind 150, Straight Flush 200.\n\nIn real Fixed-Limit Hold'em, bets and raises are capped at fixed amounts per street, which encourages mathematical, value-betting play. Here the analog is consistency: every round is exactly one deal, and your eight-round total reflects your variance over the session.\n\nLook for steady mid-range hands like two pair and trips to drive your average. Press Next between rounds and aim for a strong final score.",
  settings,
  initialState:(seed:number,s:S)=>initialState(seed,s as HoldemFixedLimitSettings),
  reducer, isTerminal,   hint: (state: HoldemFixedLimitState): HintTarget | null => {
    if (isTerminal(state)) return null;
    if (state.phase === "deal") return { selector: '[data-testid="hint-target-holdem-fixed-limit-deal"]', pulses: 3 };
    if (state.phase === "scored") return { selector: '[data-testid="hint-target-holdem-fixed-limit-next"]', pulses: 3 };
    return null;
  },
  component:HoldemFixedLimitGame,
};
