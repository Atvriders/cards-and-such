import { lazy } from "react";
import type * as React from "react";
import type { GamePlugin, HintTarget} from "../../platform/game-plugin/types.js";
import type { SeahavenTowersState, SeahavenTowersAction } from "./state.js";
import { initialState, reducer, isTerminal, seahavenTowersRuleset} from "./state.js";
import { canMove } from "../../engines/tableau/moves.js";
const SeahavenTowersGame = /* @__PURE__ */ lazy(() => import("./Game.js").then((mod) => ({ default: mod.SeahavenTowersGame as unknown as React.ComponentType<unknown> })));
export const seahavenTowersPlugin: GamePlugin<SeahavenTowersState, SeahavenTowersAction, Record<string, never>> = {
  id: "seahaven-towers",
  title: "Seahaven Towers",
  category: "solitaire",
  players: { min: 1, max: 1, multiplayer: false },
  description: "FreeCell variant: 10 columns, 4 cells, suited descending tableau, only Kings fill empties.",
  howToPlay: `Seahaven Towers is a FreeCell-family variant invented for the original Macintosh.

Setup: 10 tableau columns of 5 cards each (50 cards). The remaining 2 cards go into the middle two of 4 cells. Foundations start empty.

Tableau rule: Build down by SAME SUIT (not alternating colors). This is the key difference from FreeCell — sequences must be suited.

Empty columns: Only Kings can fill an empty tableau column.

Cells: Each of the 4 cells holds exactly one card.

Foundations: Build up by suit Ace to King.

Multi-card moves: Limited by (1 + empty cells) × 2^(empty columns), as in FreeCell.

Tips: Suited builds and the King-only empty rule make this much harder than classic FreeCell. Plan carefully — opening an empty column without a King ready is a wasted move.`,
  settings: {} as const,
  initialState: (seed: number) => initialState(seed, {}),
  reducer,
  isTerminal,
  hint: (state: SeahavenTowersState): HintTarget | null => {
    const FOUNDATION_IDS = ["f1", "f2", "f3", "f4"];
    const sources = ["fc1", "fc2", "fc3", "fc4", "c1", "c2", "c3", "c4", "c5", "c6", "c7", "c8", "c9", "c10"];
    for (const sourceId of sources) {
      const src = state.piles.find((p) => p.id === sourceId);
      if (!src || src.cards.length === 0) continue;
      for (const foundId of FOUNDATION_IDS) {
        if (canMove(state.piles, { fromPile: sourceId, toPile: foundId, count: 1 }, seahavenTowersRuleset)) {
          return { selector: `[data-testid="pile-${sourceId}"]`, pulses: 3 };
        }
      }
    }
    return null;
  },
  component: SeahavenTowersGame,
} as unknown as GamePlugin;
