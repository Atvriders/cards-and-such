import { lazy } from "react";
import type * as React from "react";
import type { GamePlugin, HintTarget} from "../../platform/game-plugin/types.js";
import type { FreecellClassicState, FreecellClassicAction } from "./state.js";
import { initialState, reducer, isTerminal, freecellClassicRuleset} from "./state.js";
import { canMove } from "../../engines/tableau/moves.js";
const FreecellClassicGame = /* @__PURE__ */ lazy(() => import("./Game.js").then((mod) => ({ default: mod.FreecellClassicGame as unknown as React.ComponentType<unknown> })));
export const freecellClassicPlugin: GamePlugin<FreecellClassicState, FreecellClassicAction, Record<string, never>> = {
  id: "freecell-classic",
  title: "FreeCell (Classic)",
  category: "solitaire",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Standard FreeCell — single deck, 4 free cells, 8 cascades, 4 foundations.",
  howToPlay: `FreeCell (Classic) is the canonical FreeCell: single 52-card deck, all dealt face-up across 8 cascades, with 4 free cells as buffer storage and 4 foundations to fill.

Setup: First 4 cascades hold 7 cards, last 4 hold 6. Everything visible from move one.

Tableau: Build down in alternating colors. Multi-card moves are allowed up to (1 + empty cells) × 2^(empty cascades).

Free cells: Each holds exactly one card as a temporary parking spot.

Foundations: Build up by suit from Ace to King.

Scoring: Score = max(0, 52 − moves). Most deals are solvable with optimal play.

Tips: Plan several moves ahead before parking a card. Bring Aces out as soon as you reasonably can.`,
  settings: {} as const,
  initialState: (seed: number) => initialState(seed, {}),
  reducer,
  isTerminal,
  hint: (state: FreecellClassicState): HintTarget | null => {
    const FOUNDATION_IDS = ["f1", "f2", "f3", "f4"];
    const sources = ["fc1", "fc2", "fc3", "fc4", "c1", "c2", "c3", "c4", "c5", "c6", "c7", "c8"];
    for (const sourceId of sources) {
      const src = state.piles.find((p) => p.id === sourceId);
      if (!src || src.cards.length === 0) continue;
      for (const foundId of FOUNDATION_IDS) {
        if (canMove(state.piles, { fromPile: sourceId, toPile: foundId, count: 1 }, freecellClassicRuleset)) {
          return { selector: `[data-testid="pile-${sourceId}"]`, pulses: 3 };
        }
      }
    }
    return null;
  },
  component: FreecellClassicGame,
};
