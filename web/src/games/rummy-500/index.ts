import { lazy } from "react";
import type * as React from "react";
import type { GamePlugin, HintTarget } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { Rummy500State } from "./state.js";
import {
  initialState, reducer, isTerminal,
  isValidMeld, canLayOffCard, cardDeadwoodValue,
} from "./state.js";
const Rummy500 = /* @__PURE__ */ lazy(() => import("./Rummy500.js").then((mod) => ({ default: mod.Rummy500 as unknown as React.ComponentType<unknown> })));
export const rummy500Settings = {
  numBots: {
    kind: "number" as const,
    label: "Bots",
    min: 1,
    max: 3,
    step: 1,
    default: 1,
  },
} as const;

type Rummy500SettingsType = SettingsOf<typeof rummy500Settings>;

type Rummy500Action =
  | { type: "draw-stock" }
  | { type: "draw-discard" }
  | { type: "meld"; cardIds: string[] }
  | { type: "layoff"; cardId: string; meldId: string }
  | { type: "discard"; cardId: string }
  | { type: "knock" };

export const rummy500Plugin: GamePlugin<Rummy500State, Rummy500Action, typeof rummy500Settings> = {
  id: "rummy-500",
  title: "Rummy 500",
  category: "cards",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Draw, meld, discard. Goal: first to 500 points across meld values.",
  howToPlay: `Rummy 500 is a meld-based card game where the goal is to accumulate points through laying down melds.

Setup: With 2 players, each gets 10 cards; with 3-4 players, each gets 7. One card is flipped face-up for the discard pile; the rest form the stock.

On your turn: Draw one card from the stock (face down) or the top of the discard pile. Then optionally meld and lay off cards, and finally discard one card.

Melds: Sets are 3+ cards of the same rank (different suits). Runs are 3+ consecutive cards of the same suit. Once melded, cards are placed face-up on the table and score points.

Lay-offs: You may add cards to any existing meld (yours or opponents') if they extend it legally.

Scoring: Each melded card scores its face value (Ace=1, face cards=10). Cards remaining in hand when someone goes out are subtracted from your score.

Going out: When you empty your hand (or play your last card as a meld/lay-off), the round ends immediately.

Controls: During your meld phase, click cards to select them, then click "Meld" to play a valid set or run. To lay off, click one card then click a table meld group. Click a single selected card and "Discard Selected" to discard it.`,
  settings: rummy500Settings,
  initialState: (seed: number, settings: Rummy500SettingsType) =>
    initialState(seed, settings),
  reducer,
  isTerminal,
  hint: (state: Rummy500State): HintTarget | null => {
    if (state.phase === "done" || state.phase === "bot-turn") return null;
    if (state.phase === "player-draw") {
      // Prefer the discard if it would extend an existing meld of yours.
      const top = state.discardPile[state.discardPile.length - 1];
      if (top) {
        const myMelds = state.tableMelds.filter((m) => m.owner === 0);
        if (myMelds.some((m) => canLayOffCard(top, m))) {
          return { selector: '[data-testid="hint-target-rummy-500-draw-discard"]', pulses: 3 };
        }
      }
      return { selector: '[data-testid="hint-target-rummy-500-draw-stock"]', pulses: 3 };
    }
    // player-meld: pulse a hand card that fits into a layoff or completes a 3-meld.
    const hand = state.hands[0] ?? [];
    const myMelds = state.tableMelds.filter((m) => m.owner === 0);
    for (const c of hand) {
      for (const m of myMelds) {
        if (canLayOffCard(c, m)) {
          return { selector: `[data-testid="hint-target-rummy-500-${c.id}"]`, pulses: 3 };
        }
      }
    }
    // Try any 3-card subset that forms a valid meld.
    for (let i = 0; i < hand.length; i++) {
      for (let j = i + 1; j < hand.length; j++) {
        for (let k = j + 1; k < hand.length; k++) {
          const trio = [hand[i]!, hand[j]!, hand[k]!];
          if (isValidMeld(trio)) {
            return { selector: `[data-testid="hint-target-rummy-500-${trio[0]!.id}"]`, pulses: 3 };
          }
        }
      }
    }
    // Fallback: discard the highest-value card.
    if (hand.length === 0) return null;
    const worst = hand.reduce((hi, c) =>
      cardDeadwoodValue(c.rank) > cardDeadwoodValue(hi.rank) ? c : hi,
    );
    return { selector: `[data-testid="hint-target-rummy-500-${worst.id}"]`, pulses: 3 };
  },
  component: Rummy500,
};
