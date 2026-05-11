import { lazy } from "react";
import type * as React from "react";
import type { GamePlugin, HintTarget} from "../../platform/game-plugin/types.js";
import type { TripleFreecellState, TripleFreecellAction } from "./state.js";
import { initialState, reducer, isTerminal, tripleFreecellRuleset} from "./state.js";
import { canMove } from "../../engines/tableau/moves.js";
const TripleFreecellGame = /* @__PURE__ */ lazy(() => import("./Game.js").then((mod) => ({ default: mod.TripleFreecellGame as unknown as React.ComponentType<unknown> })));
export const tripleFreecellPlugin: GamePlugin<TripleFreecellState, TripleFreecellAction, Record<string, never>> = {
  id: "triple-freecell",
  title: "Triple FreeCell",
  category: "solitaire",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Three-deck FreeCell with 13 cascades, 8 free cells, and 12 foundations.",
  howToPlay: `Triple FreeCell uses three standard 52-card decks (156 cards), all dealt face-up across 13 cascades of 12 cards each.

Setup: 13 cascades, 8 free cells (more than classic), 12 foundation piles to fill (three runs per suit).

Tableau: Build down in alternating colors. Multi-card moves are allowed up to (1 + empty cells) × 2^(empty cascades).

Free cells: Each holds exactly one card. With 8 cells you have substantial buffer compared to classic FreeCell.

Foundations: Build up by suit Ace to King. There are 12 foundation piles total.

Tips: With 13 long columns, plan your sequences carefully. Empty columns are extremely valuable for relocating long sequences.`,
  settings: {} as const,
  initialState: (seed: number) => initialState(seed, {}),
  reducer,
  isTerminal,
  hint: (state: TripleFreecellState): HintTarget | null => {
    const FOUNDATION_IDS = ["f1", "f2", "f3", "f4", "f5", "f6", "f7", "f8", "f9", "f10", "f11", "f12"];
    const sources = ["fc1", "fc2", "fc3", "fc4", "fc5", "fc6", "fc7", "fc8", "c1", "c2", "c3", "c4", "c5", "c6", "c7", "c8", "c9", "c10", "c11", "c12", "c13"];
    for (const sourceId of sources) {
      const src = state.piles.find((p) => p.id === sourceId);
      if (!src || src.cards.length === 0) continue;
      for (const foundId of FOUNDATION_IDS) {
        if (canMove(state.piles, { fromPile: sourceId, toPile: foundId, count: 1 }, tripleFreecellRuleset)) {
          return { selector: `[data-testid="pile-${sourceId}"]`, pulses: 3 };
        }
      }
    }
    return null;
  },
  component: TripleFreecellGame,
} as unknown as GamePlugin<TripleFreecellState, TripleFreecellAction, Record<string, never>>;
