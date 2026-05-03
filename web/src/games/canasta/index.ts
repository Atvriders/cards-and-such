import { lazy } from "react";
import type * as React from "react";
import type { GamePlugin, HintTarget } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { CanastaState } from "./state.js";
import { initialState, reducer, isTerminal, isWild, isValidMeld, cardPoints } from "./state.js";
const Canasta = /* @__PURE__ */ lazy(() => import("./Canasta.js").then((mod) => ({ default: mod.Canasta as unknown as React.ComponentType<unknown> })));
export const canastaSettings = {
  botCount: {
    kind: "number" as const,
    label: "Bots",
    min: 1,
    max: 3,
    step: 1,
    default: 1,
  },
} as const;

type CanastaSettingsRaw = SettingsOf<typeof canastaSettings>;

type CanastaAction =
  | { type: "draw-stock" }
  | { type: "draw-discard" }
  | { type: "meld"; cardIds: string[] }
  | { type: "layoff"; cardId: string; meldId: string }
  | { type: "discard"; cardId: string }
  | { type: "go-out"; cardId: string };

export const canastaPlugin: GamePlugin<CanastaState, CanastaAction, typeof canastaSettings> = {
  id: "canasta",
  title: "Canasta",
  category: "cards",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Classic meld-and-canasta game. Form 7-card melds for huge bonuses.",
  howToPlay: `Canasta is a rummy-style game played with 2 decks plus 4 jokers (108 cards total). The goal is to form melds — sets of 3 or more cards of the same rank — and accumulate points.

Setup: Each player is dealt 11 cards. One card is flipped to start the discard pile; the rest form the stock.

On your turn: Draw from the stock or take the top discard card. Then you may meld cards from your hand onto the table. Finally, discard one card to end your turn.

Melds: Groups of 3+ cards of the same rank (no runs in standard Canasta). Wild cards (2s and Jokers, worth 20 pts each) may be added, but wilds cannot outnumber naturals and a meld may have at most 3 wilds. Rank-3 cards cannot be melded.

First meld threshold: Your first meld must meet a minimum point value based on your current score (50 pts at game start, rising as your score grows).

Canasta: A meld of 7 or more cards earns a bonus — 500 for a natural (no wilds), 300 for a mixed. You must have at least one Canasta before going out.

Going out: Discard your last card (after forming a Canasta) to go out and earn a 100-point bonus.

Controls: Draw from stock or click discard pile. Click cards to select, then Meld or Lay Off onto existing melds. Click Discard to end your turn.`,
  settings: canastaSettings,
  initialState: (seed: number, s: CanastaSettingsRaw) => initialState(seed, s),
  reducer,
  isTerminal,
  hint: (state: CanastaState): HintTarget | null => {
    if (state.phase === "done" || state.phase === "bot-turn") return null;
    if (state.phase === "player-draw") {
      return { selector: '[data-testid="hint-target-canasta-draw-stock"]', pulses: 3 };
    }
    // player-meld: pulse a card that completes a 3-meld OR can lay off onto an existing meld.
    const hand = state.hands[0] ?? [];
    if (hand.length === 0) return null;
    const myMelds = state.tableMelds.filter((m) => m.owner === 0);
    // Lay-off candidate: same rank as an existing meld of mine.
    for (const c of hand) {
      if (isWild(c)) continue;
      for (const m of myMelds) {
        const naturalRank = m.cards.filter((x) => !isWild(x))[0]?.rank;
        if (naturalRank !== undefined && c.rank === naturalRank) {
          return { selector: `[data-testid="hint-target-canasta-${c.id}"]`, pulses: 3 };
        }
      }
    }
    // Try a 3-card meld using cards in hand (same rank, allow up to 1 wild).
    const buckets = new Map<number, typeof hand[number][]>();
    for (const c of hand) {
      if (isWild(c) || c.rank === 3) continue;
      const arr = buckets.get(c.rank) ?? [];
      arr.push(c);
      buckets.set(c.rank, arr);
    }
    const wilds = hand.filter((c) => isWild(c));
    for (const [, group] of buckets) {
      const trio = group.length >= 3 ? group.slice(0, 3) : (group.length >= 2 && wilds.length >= 1 ? [...group.slice(0, 2), wilds[0]!] : null);
      if (trio && isValidMeld(trio)) {
        return { selector: `[data-testid="hint-target-canasta-${trio[0]!.id}"]`, pulses: 3 };
      }
    }
    // Fallback: highest-value non-wild card to discard.
    const nonWilds = hand.filter((c) => !isWild(c));
    if (nonWilds.length === 0) return null;
    const worst = nonWilds.reduce((hi, c) =>
      cardPoints(c.rank) > cardPoints(hi.rank) ? c : hi,
    );
    return { selector: `[data-testid="hint-target-canasta-${worst.id}"]`, pulses: 3 };
  },
  component: Canasta,
};
