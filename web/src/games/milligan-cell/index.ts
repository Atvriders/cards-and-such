import { lazy } from "react";
import type * as React from "react";
import type { GamePlugin, HintTarget} from "../../platform/game-plugin/types.js";
import type { MilliganCellState, MilliganCellAction } from "./state.js";
import { initialState, reducer, isTerminal, milliganCellRuleset} from "./state.js";
import { canMove } from "../../engines/tableau/moves.js";
const MilliganCell = /* @__PURE__ */ lazy(() => import("./Game.js").then((mod) => ({ default: mod.MilliganCell as unknown as React.ComponentType<unknown> })));
export const milliganCellPlugin: GamePlugin<MilliganCellState, MilliganCellAction, Record<string, never>> = {
  id: "milligan-cell",
  title: "Milligan Cell",
  category: "solitaire",
  players: { min: 1, max: 1, multiplayer: false },
  description: "FreeCell with 12 free cells instead of 4. An easier, spacious variant perfect for beginners.",
  howToPlay: `Milligan Cell is a relaxed variant of FreeCell. The same one deck of 52 cards is dealt face-up across eight tableau columns, with the first four columns holding seven cards each and the last four holding six cards each.

The big difference from standard FreeCell is that you have twelve free cells available — three times as many as usual. Each cell holds exactly one card as a temporary buffer.

Tableau: Build down in alternating colors (red on black, black on red). You may move a properly sequenced group of cards if you have enough empty cells and empty columns — the maximum you can move at once equals (1 + empty cells) × 2^(empty columns).

Foundations: Build each of the four suits up from Ace to King. As soon as a card can legally go to a foundation, you can click "Auto-move" to send all eligible cards automatically.

Goal: Move all 52 cards to the four foundations.

Strategy: With 12 cells the game is much more forgiving than standard FreeCell. Focus on uncovering Aces and getting suits onto foundations quickly. Even so, avoid filling all 12 cells simultaneously — keep at least a few open for maneuvering.`,
  settings: {} as const,
  initialState: (seed: number) => initialState(seed),
  reducer,
  isTerminal,
  hint: (state: MilliganCellState): HintTarget | null => {
    const FOUNDATION_IDS = ["f1", "f2", "f3", "f4"];
    const sources = ["fc1", "fc2", "fc3", "fc4", "fc5", "fc6", "fc7", "fc8", "fc9", "fc10", "fc11", "fc12", "c1", "c2", "c3", "c4", "c5", "c6", "c7", "c8"];
    for (const sourceId of sources) {
      const src = state.piles.find((p) => p.id === sourceId);
      if (!src || src.cards.length === 0) continue;
      for (const foundId of FOUNDATION_IDS) {
        if (canMove(state.piles, { fromPile: sourceId, toPile: foundId, count: 1 }, milliganCellRuleset)) {
          return { selector: `[data-testid="pile-${sourceId}"]`, pulses: 3 };
        }
      }
    }
    return null;
  },
  component: MilliganCell,
};
