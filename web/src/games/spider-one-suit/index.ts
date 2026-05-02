import type { GamePlugin, HintTarget } from "../../platform/game-plugin/types.js";
import type { SpiderOneSuitState, SpiderOneSuitAction } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { SpiderOneSuitGame } from "./Game.js";

export const spiderOneSuitPlugin: GamePlugin<SpiderOneSuitState, SpiderOneSuitAction, Record<string, never>> = {
  id: "spider-one-suit",
  title: "Spider (One Suit)",
  category: "solitaire",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Easy Spider — every card is a spade. Build descending K-A runs to clear them.",
  howToPlay: `Spider (One Suit) is the easy mode of Spider Solitaire — all 104 cards are spades, so every sequence trivially matches suit.

Setup: 10 tableau columns. First 4 columns get 6 cards (5 face-down + 1 face-up), the rest get 5 (4+1). 50 cards remain in the stock for 5 deal-rows.

Tableau: Build down by rank (any "suit" — they're all spades). Move single cards or descending sequences. Empty columns accept any card.

Goal: Build 8 complete K→A runs in the same suit. Each completed run is automatically removed to a foundation.

Stock: Click the stock to deal one new card to every column. You may not deal a row if any column is empty.

Tips: Even at one suit, this is still tactical. Plan your descending runs carefully — once you cover up a card with a higher rank from a different stack, you'll need to move it to clear the cover.`,
  settings: {} as const,
  initialState: (seed: number) => initialState(seed, {}),
  reducer,
  isTerminal,
  hint: (state: SpiderOneSuitState): HintTarget | null => {
    // Priority 1: any tableau column whose top two face-up cards form a same-suit descending run.
    const TABLEAU_IDS = ["t1", "t2", "t3", "t4", "t5", "t6", "t7", "t8", "t9", "t10"];
    for (const id of TABLEAU_IDS) {
      const pile = state.piles.find((p) => p.id === id);
      if (!pile || pile.cards.length < 2) continue;
      const faceUp = pile.faceUpCount ?? 0;
      if (faceUp < 2) continue;
      const top = pile.cards[pile.cards.length - 1]!;
      const below = pile.cards[pile.cards.length - 2]!;
      if (top.suit === below.suit && (below.rank as number) === (top.rank as number) + 1) {
        return { selector: `[data-testid="pile-${id}"]`, pulses: 3 };
      }
    }
    // Priority 2: deal another row if all columns have cards and stock has >= 10.
    const stock = state.piles.find((p) => p.id === "stock");
    const allFilled = TABLEAU_IDS.every((id) => {
      const p = state.piles.find((pp) => pp.id === id);
      return p && p.cards.length > 0;
    });
    if (stock && stock.cards.length >= 10 && allFilled) {
      return { selector: `[data-testid="pile-stock"]`, pulses: 3 };
    }
    return null;
  },
  component: SpiderOneSuitGame,
} as unknown as GamePlugin;
