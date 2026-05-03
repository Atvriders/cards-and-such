import { lazy } from "react";
import type * as React from "react";
import type { GamePlugin, HintTarget } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { BadugiState, BadugiAction } from "./state.js";
import { initialState, reducer, isTerminal, evaluateBadugi } from "./state.js";
const Badugi = /* @__PURE__ */ lazy(() => import("./Badugi.js").then((mod) => ({ default: mod.Badugi as unknown as React.ComponentType<unknown> })));
export const badugiSettings = {
  startingBankroll: {
    kind: "enum" as const,
    label: "Starting Bankroll",
    options: ["500", "1000", "5000"] as const,
    default: "1000",
  },
  anteSize: {
    kind: "enum" as const,
    label: "Ante Size",
    options: ["10", "25", "50"] as const,
    default: "25",
  },
} as const;

type BadugiSettingsType = SettingsOf<typeof badugiSettings>;

export const badugiPlugin: GamePlugin<BadugiState, BadugiAction, typeof badugiSettings> = {
  id: "badugi",
  title: "Badugi",
  category: "cards",
  players: { min: 1, max: 1, multiplayer: false },
  description: "4-card draw lowball — make the best Badugi: 4 cards all different suits and ranks.",
  howToPlay: `Badugi is a unique 4-card draw poker variant where the goal is to make the lowest possible hand with all four cards of different suits and different ranks — called a "Badugi."

Each player is dealt 4 cards. The hand with the most qualifying cards wins; if both players have a Badugi (4 qualifying cards), the player with the lower high card wins. Aces are low (best card).

A Badugi hand is ranked by the number of effective cards: a 4-card Badugi always beats a 3-card Badugi, which beats a 2-card Badugi. If two hands have the same number of effective cards, compare the highest card in each — lower wins. Then compare the next highest if needed.

Hands with duplicate suits or duplicate ranks have those duplicates "discounted" — you play only the qualifying subset.

The game has 3 betting rounds alternating with 3 draw rounds: Bet → Draw → Bet → Draw → Bet → Draw → Showdown. Each draw, select cards to discard and replacement cards are dealt.

Strategy: discard cards that share a suit or rank with your better cards. Keep the lowest cards you can while maintaining different suits. Standing pat (not drawing) signals a strong hand.

Settings: Starting Bankroll ($500/$1000/$5000), Ante Size ($10/$25/$50). The game ends when one player goes bust.`,
  settings: badugiSettings,
  initialState: (seed: number, settings: BadugiSettingsType) => initialState(seed, settings),
  reducer,
  isTerminal,
  hint: (state: BadugiState): HintTarget | null => {
    if (state.phase === "waiting" || state.phase === "showdown") {
      if (state.bankroll <= 0 || state.botBankroll <= 0) return null;
      return { selector: '[data-testid="hint-target-badugi-deal"]', pulses: 3 };
    }
    const isBetting = state.phase === "bet1" || state.phase === "bet2" || state.phase === "bet3";
    const isDraw = state.phase === "draw1" || state.phase === "draw2" || state.phase === "draw3";
    if (isDraw) return { selector: '[data-testid="hint-target-badugi-draw"]', pulses: 3 };
    if (!isBetting || !state.playerTurn) return null;
    const toCall = Math.max(0, state.botBet - state.playerBet);
    const r = evaluateBadugi(state.playerHand);
    // Strength: badugi size + lowness of high card (lower = better).
    const high = r.cards.length ? Math.max(...r.cards.map((c) => (c.rank === 1 ? 1 : c.rank))) : 14;
    const strength = Math.min(0.95, r.size * 0.2 + Math.max(0, 13 - high) * 0.03);
    if (toCall === 0) return { selector: '[data-testid="hint-target-badugi-check"]', pulses: 3 };
    const odds = toCall / (state.pot + toCall);
    if (strength > odds) return { selector: '[data-testid="hint-target-badugi-call"]', pulses: 3 };
    return { selector: '[data-testid="hint-target-badugi-fold"]', pulses: 3 };
  },
  component: Badugi,
};
