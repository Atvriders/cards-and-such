import { lazy } from "react";
import type * as React from "react";
import type { GamePlugin, HintTarget } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { ScopaState } from "./state.js";
import { initialState, reducer, isTerminal, findCaptureSets, faceValue, COINS_SUIT, SETTEBELLO_RANK } from "./state.js";
const Scopa = /* @__PURE__ */ lazy(() => import("./Scopa.js").then((mod) => ({ default: mod.Scopa as unknown as React.ComponentType<unknown> })));
export const scopaSettings = {} as const;
type ScopaSettings = SettingsOf<typeof scopaSettings>;

type ScopaAction =
  | { type: "select"; cardId: string }
  | { type: "capture"; tableCardIds: string[] }
  | { type: "place" };

export const scopaPlugin: GamePlugin<ScopaState, ScopaAction, typeof scopaSettings> = {
  id: "scopa",
  title: "Scopa",
  category: "cards",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Italian fishing card game. Capture table cards by matching values to score points.",
  howToPlay: `Scopa (meaning "broom" in Italian) is a classic Italian fishing card game played with a 40-card deck.

Setup: Three cards are dealt to each player and four cards are placed face-up on the table.

Your turn: Select a card from your hand, then either capture or place it.
- Capture: Your card's face value must exactly equal one table card's value, OR the sum of multiple table cards. You take all those cards (plus your played card) into your capture pile.
- Place: If you cannot or choose not to capture, place your card on the table.

Scopa! If your capture clears the entire table, you score a bonus "scopa" point.

When hands are empty, three more cards are dealt to each player. Continue until the deck is exhausted.

Scoring (1 point each):
- Most cards captured overall
- Most coins (♦ diamonds) in captures
- The 7 of coins (♦7, called "settebello")
- Prime: highest "prime value" per suit (7=21, 6=18, A=16, 5=15, 4=14, 3=13, 2=12, face=10)

Plus 1 point per scopa scored during play.

Strategy: Prioritize capturing the settebello and coins cards. Avoid building up the table when the opponent can sweep it for a scopa.`,
  settings: scopaSettings,
  initialState: (seed: number, _settings: ScopaSettings) => initialState(seed),
  reducer,
  isTerminal,
  hint: (state: ScopaState): HintTarget | null => {
    if (state.phase !== "player-turn" || state.playerHand.length === 0) return null;
    // Score each hand card by best capture: longer combos preferred,
    // settebello/coins preferred, else any capture, else lowest card.
    let bestId: string | null = null;
    let bestScore = -1;
    for (const card of state.playerHand) {
      const sets = findCaptureSets(state.table, faceValue(card.rank));
      let score = 0;
      if (sets.length > 0) {
        // Prefer longest combo with valuable cards.
        const longest = sets.reduce((a, b) => (b.length > a.length ? b : a));
        score = 100 + longest.length * 10;
        // Bonus for capturing the settebello or coins.
        for (const c of longest) {
          if (c.suit === COINS_SUIT && c.rank === SETTEBELLO_RANK) score += 50;
          else if (c.suit === COINS_SUIT) score += 5;
        }
      }
      if (score > bestScore) {
        bestScore = score;
        bestId = card.id;
      }
    }
    if (!bestId && state.playerHand.length > 0) {
      // No captures — pulse the lowest face-value card to place safely.
      const lowest = state.playerHand.reduce((lo, c) =>
        faceValue(c.rank) < faceValue(lo.rank) ? c : lo,
      );
      bestId = lowest.id;
    }
    if (!bestId) return null;
    return { selector: `[data-testid="hint-target-scopa-${bestId}"]`, pulses: 3 };
  },
  component: Scopa,
};
