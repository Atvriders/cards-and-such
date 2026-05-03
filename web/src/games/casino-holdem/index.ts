import { lazy } from "react";
import type * as React from "react";
import type { GamePlugin, HintTarget } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { CasinoHoldemState, CasinoHoldemAction } from "./state.js";
import { initialState, reducer, isTerminal, bestHand } from "./state.js";
const CasinoHoldemGame = /* @__PURE__ */ lazy(() => import("./Game.js").then((mod) => ({ default: mod.CasinoHoldemGame as unknown as React.ComponentType<unknown> })));
export const casinoHoldemSettings = {
  anteSize: {
    kind: "enum" as const,
    label: "Ante Size",
    options: ["10", "25", "50"] as const,
    default: "25",
  },
  hands: {
    kind: "enum" as const,
    label: "Hands per Session",
    options: ["5", "10", "20"] as const,
    default: "10",
  },
} as const;

type Settings = SettingsOf<typeof casinoHoldemSettings>;

export const casinoHoldemPlugin: GamePlugin<CasinoHoldemState, CasinoHoldemAction, typeof casinoHoldemSettings> = {
  id: "casino-holdem",
  title: "Casino Hold'em",
  category: "cards",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Texas Hold'em vs dealer. Ante, see 3 community cards, then Fold or Call.",
  howToPlay: `Casino Hold'em is a house-banked version of Texas Hold'em where you play against the dealer instead of other players.

Setup: Pay an ante bet, then receive two hole cards. Three community cards (the flop) are dealt face-up. The dealer also gets two hole cards, kept hidden.

Decision: After seeing the flop and your hole cards, decide: Call (place a call bet of 2× the ante and see the turn and river), or Fold (forfeit your ante).

Settlement: The dealer reveals their hole cards. A turn and river card are added to complete the five-card community. The best five-card hand from each player's 2 hole cards + 5 community cards is ranked. Dealer must have a pair of 4s or better to qualify.

If dealer doesn't qualify: Ante pays 1:1, call bet is returned. If dealer qualifies and you win: Ante pays 1:1, call bet pays according to hand rank (pair through straight flush: 1:1 up to 20:1). If dealer qualifies and wins: you lose both bets. Ties push.

Strategy: Call with any pair or better. Fold only against strong dealer upcards with a weak hand. In practice, you should call approximately 82% of the time — the math strongly favours calling over folding.`,
  settings: casinoHoldemSettings,
  initialState: (seed: number, settings: Settings) => initialState(seed, settings),
  reducer,
  isTerminal,
  hint: (state: CasinoHoldemState): HintTarget | null => {
    if (state.phase === "ante" || state.phase === "settled") {
      if (state.bankroll <= 0) return null;
      return { selector: '[data-testid="hint-target-casino-holdem-deal"]', pulses: 3 };
    }
    if (state.phase !== "decision") return null;
    // Casino Hold'em: math says call ~82% of the time. Strict heuristic:
    // call with any pair or better, suited connectors, two big cards (J+).
    if (state.playerCards.length < 2 || state.communityCards.length < 3) return null;
    const r = bestHand(state.playerCards, state.communityCards);
    if (r.class !== "high-card") {
      return { selector: '[data-testid="hint-target-casino-holdem-call"]', pulses: 3 };
    }
    const ranks = state.playerCards.map((c) => (c.rank === 1 ? 14 : c.rank));
    const high = Math.max(...ranks);
    if (high >= 11) return { selector: '[data-testid="hint-target-casino-holdem-call"]', pulses: 3 };
    return { selector: '[data-testid="hint-target-casino-holdem-fold"]', pulses: 3 };
  },
  component: CasinoHoldemGame,
};
