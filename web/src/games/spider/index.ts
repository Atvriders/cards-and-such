import type { GamePlugin, HintTarget } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { SpiderState, SpiderAction } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { Spider } from "./Spider.js";

export const spiderSettings = {
  suits: {
    kind: "enum" as const,
    label: "Difficulty",
    options: ["1", "2", "4"] as const,
    default: "1" as const,
  },
} as const;

type SpiderSettings = SettingsOf<typeof spiderSettings>;

export const spiderPlugin: GamePlugin<SpiderState, SpiderAction, typeof spiderSettings> = {
  id: "spider",
  title: "Spider Solitaire",
  category: "solitaire",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Two-deck tableau. Build same-suit descending sequences to remove them.",
  howToPlay: `Clear all cards from the tableau by building complete same-suit sequences from King down to Ace, which are then automatically removed.

Difficulty: choose 1 suit (easy, all cards match), 2 suits, or 4 suits (hard, must build strictly same-suit runs to complete a sequence).

Deal: 104 cards (two decks) fill 10 tableau columns. 50 remaining cards sit in a stock that deals 10 extra cards (one per column) each time you click it.

Moves: Build tableau columns in descending order. Mixed-suit descending sequences can be moved together on the tableau, but only a complete same-suit King-to-Ace run is automatically removed. Click a card to select it and then click a valid destination to move it.

Scoring: Your score starts at 500 and decreases by 1 for every move made. Each completed sequence removed scores +100. Aim for a high final score by completing the game in as few moves as possible.

Tips: In 4-suit mode, focus on building same-suit sequences from the start — mixed runs are temporary scaffolding. Deal from stock only when truly stuck; extra cards make the board more chaotic.`,
  settings: spiderSettings,
  initialState: (seed: number, settings: SpiderSettings) => initialState(seed, settings),
  reducer,
  isTerminal,
  hint: (state: SpiderState): HintTarget | null => {
    // Priority 1: any tableau column whose top card is part of a same-suit
    // descending run (top two face-up cards same suit, top.rank+1 = below).
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
    // Priority 2: deal another row if all columns have cards and stock has >=10.
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
  component: Spider,
};
