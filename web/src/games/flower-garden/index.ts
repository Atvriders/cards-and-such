import type { GamePlugin, HintTarget} from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { FlowerGardenState, FlowerGardenAction } from "./state.js";
import { initialState, reducer, isTerminal, flowerGardenRuleset} from "./state.js";
import { canMove } from "../../engines/tableau/moves.js";
import { FlowerGarden } from "./FlowerGarden.js";

export const flowerGardenSettings = {} as const;

type FlowerGardenSettings = SettingsOf<typeof flowerGardenSettings>;

export const flowerGardenPlugin: GamePlugin<FlowerGardenState, FlowerGardenAction, typeof flowerGardenSettings> = {
  id: "flower-garden",
  title: "Flower Garden",
  category: "solitaire",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Build six bouquet columns down by any suit with a 16-card garden reserve.",
  howToPlay: `Flower Garden is an open solitaire where all tableau cards are visible from the start, giving you full information to plan ahead.

Setup: Six tableau columns (the "bouquets") each hold 6 face-up cards — 36 cards total. The remaining 16 cards form the "garden" reserve pile, accessible one at a time from the top. Four foundations start empty.

Goal: Build all four foundations from Ace up to King in the same suit.

Tableau rules: Build columns down by any suit — rank is the only constraint. Place a card on any column whose top card is exactly one rank higher, regardless of suit. Only single-card moves are allowed — no sequences can be moved together.

Garden reserve: The top card of the garden is always available and can be played to any foundation or tableau column that accepts it. The card below becomes available once the top card is played.

Tips: Since all bouquet cards are face-up you can plan long chains of moves. Work methodically to expose the Aces buried in the garden. Avoid filling columns completely, as you need empty space to shuffle cards around. The garden pile can save you when the tableau gets stuck.`,
  settings: flowerGardenSettings,
  initialState: (seed: number, _settings: FlowerGardenSettings) => initialState(seed),
  reducer,
  isTerminal,
  hint: (state: FlowerGardenState): HintTarget | null => {
    const FOUNDATION_IDS = ["f1", "f2", "f3", "f4"];
    const sources = ["t1", "t2", "t3", "t4", "t5", "t6"];
    for (const sourceId of sources) {
      const src = state.piles.find((p) => p.id === sourceId);
      if (!src || src.cards.length === 0) continue;
      for (const foundId of FOUNDATION_IDS) {
        if (canMove(state.piles, { fromPile: sourceId, toPile: foundId, count: 1 }, flowerGardenRuleset)) {
          return { selector: `[data-testid="pile-${sourceId}"]`, pulses: 3 };
        }
      }
    }
    const stock = state.piles.find((p) => p.id === "stock");
    if (stock && stock.cards.length > 0) {
      return { selector: `[data-testid="pile-stock"]`, pulses: 3 };
    }
    return null;
  },
  component: FlowerGarden,
};
