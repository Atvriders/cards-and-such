import type { GamePlugin, HintTarget} from "../../platform/game-plugin/types.js";
import type { SoliState, SoliAction } from "./state.js";
import { initialState, reducer, isTerminal, vegasKlondikeRuleset} from "./state.js";
import { canMove } from "../../engines/tableau/moves.js";
import { SoliGame } from "./Game.js";

export const vegasKlondikePlugin: GamePlugin<SoliState, SoliAction, Record<string, never>> = {
  id: "vegas-klondike",
  title: "Vegas Klondike",
  category: "solitaire",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Klondike with Vegas casino-style scoring: -$52 buy-in, +$5 per foundation card.",
  howToPlay: `Vegas Klondike plays like classic Klondike but with casino-style cumulative scoring tracked as a dollar bankroll.

Setup: Identical to standard Klondike — 7 tableau columns, 24-card stock, 4 foundations. You begin with -$52 (the buy-in for one deal).

Draw: Single pass through the stock at draw-1 (one card per click to the waste). No recycling — once the stock is empty, that's it.

Tableau: Build down in alternating colors. Move single cards or valid alt-color sequences. Empty columns accept Kings only.

Vegas Scoring: +$5 every time a card moves to a foundation. A complete win nets +$208 ($260 in payout minus the $52 buy-in). Most deals lose money — that's the casino edge.

Tips: Treat every move as if it costs you cash. Don't draw from the stock unless you can't move any tableau or waste card. The 50-50 mark is the breakeven — past 11 cards on foundations you've recovered your buy-in.`,
  settings: {} as const,
  initialState: (seed: number) => initialState(seed, {}),
  reducer,
  isTerminal,
  hint: (state: SoliState): HintTarget | null => {
    const FOUNDATION_IDS = ["f1", "f2", "f3", "f4"];
    const sources = ["waste", "t1", "t2", "t3", "t4", "t5", "t6", "t7"];
    for (const sourceId of sources) {
      const src = state.piles.find((p) => p.id === sourceId);
      if (!src || src.cards.length === 0) continue;
      for (const foundId of FOUNDATION_IDS) {
        if (canMove(state.piles, { fromPile: sourceId, toPile: foundId, count: 1 }, vegasKlondikeRuleset)) {
          return { selector: `[data-testid="pile-${sourceId}"]`, pulses: 3 };
        }
      }
    }
    const stock = state.piles.find((p) => p.id === "stock");
    if (stock && stock.cards.length > 0) {
      return { selector: `[data-testid="pile-stock"]`, pulses: 3 };
    }
    const waste = state.piles.find((p) => p.id === "waste");
    if (waste && waste.cards.length > 0) {
      return { selector: `[data-testid="pile-stock"]`, pulses: 3 };
    }
    return null;
  },
  component: SoliGame,
} as unknown as GamePlugin;
