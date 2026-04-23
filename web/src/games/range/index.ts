import type { GamePlugin } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { RangeState, RangeAction, RangeSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { Range } from "./Range.js";

export const rangeSettings = {
  difficulty: {
    kind: "enum" as const,
    label: "Difficulty",
    options: ["easy", "medium"] as const,
    default: "easy",
  },
} as const;

type RangeSettingsType = SettingsOf<typeof rangeSettings>;

export const rangePlugin: GamePlugin<RangeState, RangeAction, typeof rangeSettings> = {
  id: "range",
  title: "Range",
  category: "board",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Shade cells so each numbered cell can see exactly the right number of white cells in 4 directions.",
  howToPlay: `Range is a shading logic puzzle. The grid contains some numbered clue cells and many blank cells. Your goal is to shade some blank cells black so that every number equals the total count of white cells visible from that position in the four cardinal directions — including the numbered cell itself.

A numbered cell "sees" white cells in each direction until it hits a black cell or the edge of the grid. So a number 4 sees exactly 3 other white cells beyond itself (in any combination of up, down, left, and right).

Two additional rules keep the puzzle well-constrained: no two black cells may be orthogonally adjacent to each other, and all white cells must form a single connected group (reachable from any white cell by moving only through white cells).

To play: click any blank (non-numbered) cell to toggle it black. Numbered cells that currently see the wrong count are highlighted in red. Click a black cell to unshade it.

Strategy: numbered cells with small values need many nearby black cells; those with large values must keep their sight lines open. The no-adjacent-blacks rule means isolated single black cells are the only option. Start with cells forced by both a tight sight-line constraint and the adjacency restriction.`,
  settings: rangeSettings,
  initialState: (seed: number, settings: RangeSettingsType) => initialState(seed, settings),
  reducer,
  isTerminal,
  component: Range,
};
