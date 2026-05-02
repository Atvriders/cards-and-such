import type { GamePlugin, HintTarget} from "../../platform/game-plugin/types.js";
import type { CanfieldStorehouseState, CanfieldStorehouseAction } from "./state.js";
import { initialState, reducer, isTerminal, storehouseRuleset} from "./state.js";
import { canMove } from "../../engines/tableau/moves.js";
import { CanfieldStorehouse } from "./CanfieldStorehouse.js";

export const canfieldStorehouseSettings = {} as const;

export const canfieldStorehousePlugin: GamePlugin<CanfieldStorehouseState, CanfieldStorehouseAction, typeof canfieldStorehouseSettings> = {
  id: "canfield-storehouse",
  title: "Canfield Storehouse",
  category: "solitaire",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Canfield variant with 2s on foundations and a 13-card open storehouse reserve.",
  howToPlay: `Canfield Storehouse is a variant of Canfield in which the four 2s are placed on the foundations at the start, and the reserve is an open "storehouse" of 13 face-up cards you can always see and access.

Deal: The four 2s go directly to the four foundation piles. Thirteen cards are laid face-up in a row as the storehouse — every card in it is accessible. Four tableau columns receive one card each. The remaining cards form the stock (draw three at a time).

Foundations build up by suit in sequence 2-3-4-5-6-7-8-9-10-J-Q-K-A, wrapping around so Ace follows King.

Tableau columns build down in alternating colors, same as classic Canfield. Any card or legal sequence may be moved to an empty column.

Moves: Cards from the waste pile, any storehouse slot, or tableau tops may be played onto foundations or other tableau columns. Draw three cards at a time from the stock; redeal as needed.

Strategy: Tap the storehouse early — it's your most flexible resource. Try to build sequences that expose low cards in the same suit as your foundation piles.

Win condition: All 52 cards moved to the foundations.`,
  settings: canfieldStorehouseSettings,
  initialState: (seed: number) => initialState(seed),
  reducer,
  isTerminal,
  hint: (state: CanfieldStorehouseState): HintTarget | null => {
    const FOUNDATION_IDS = ["f1", "f2", "f3", "f4"];
    const sources = ["waste", "t1", "t2", "t3", "t4"];
    for (const sourceId of sources) {
      const src = state.piles.find((p) => p.id === sourceId);
      if (!src || src.cards.length === 0) continue;
      for (const foundId of FOUNDATION_IDS) {
        if (canMove(state.piles, { fromPile: sourceId, toPile: foundId, count: 1 }, storehouseRuleset)) {
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
  component: CanfieldStorehouse,
};
