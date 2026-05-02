import type { GamePlugin, HintTarget } from "../../platform/game-plugin/types.js";
import type { SpiderTwoSuitsState, SpiderTwoSuitsAction } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { SpiderTwoSuitsGame } from "./Game.js";

export const spiderTwoSuitsPlugin: GamePlugin<SpiderTwoSuitsState, SpiderTwoSuitsAction, Record<string, never>> = {
  id: "spider-two-suits",
  title: "Spider (Two Suits)",
  category: "solitaire",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Spider with two suits — 4 copies of spades + 4 copies of hearts (104 cards).",
  howToPlay: `Spider (Two Suits) is the medium-difficulty Spider — only spades and hearts are in play (4 copies of each, 104 cards total).

Setup: 10 columns. First 4 with 6 cards, last 6 with 5. 50-card stock for 5 deal-rows.

Tableau: Build down by rank, mixing suits is allowed for moves but only same-suit K→A runs are auto-removed.

Goal: Build 8 complete K→A runs, all in the same suit per run. Each completes and is removed automatically.

Tips: Two suits adds real difficulty over the one-suit version — when a hearts 8 lands on a spades 9, the run cannot be lifted as a unit. Plan to disentangle suit clusters using empty columns and the stock deals.`,
  settings: {} as const,
  initialState: (seed: number) => initialState(seed, {}),
  reducer,
  isTerminal,
  hint: (state: SpiderTwoSuitsState): HintTarget | null => {
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
  component: SpiderTwoSuitsGame,
} as unknown as GamePlugin;
