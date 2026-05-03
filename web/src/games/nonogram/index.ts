import { lazy } from "react";
import type * as React from "react";
import type { GamePlugin } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { NonogramState, NonogramAction } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
const Nonogram = /* @__PURE__ */ lazy(() => import("./Nonogram.js").then((mod) => ({ default: mod.Nonogram as unknown as React.ComponentType<unknown> })));
export const nonogramSettings = {
  size: {
    kind: "enum" as const,
    label: "Grid size",
    options: ["5", "10", "15"] as const,
    default: "10" as const,
  },
} as const;

type NonogramSettingsType = SettingsOf<typeof nonogramSettings>;

export const nonogramPlugin: GamePlugin<NonogramState, NonogramAction, typeof nonogramSettings> = {
  id: "nonogram",
  title: "Nonogram",
  category: "board",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Logic puzzle — fill cells to match the row/column clues.",
  howToPlay: `Nonogram (also called Picross) is a logic puzzle where you fill in a grid of cells based on numerical clues beside each row and column. The clues tell you how many consecutive filled cells appear in that row or column, in order. For example, a clue of "3 1" means there is a run of 3 filled cells, then at least one gap, then a run of 1 filled cell.

Left-click a cell to fill it (dark blue). Left-click again to clear it. Shift-click or right-click a cell to mark it with an × (definitely empty). This helps you track cells you know are blank.

Solve by working out which cells must be filled given the constraints. When every cell in the grid matches the hidden solution, the puzzle is complete.

Grid sizes: 5×5 for a quick puzzle, 10×10 for a medium challenge, or 15×15 for an expert-level challenge. Each game seeds a different pattern from a built-in library, then may flip it horizontally or vertically for additional variety.

Score is based on how few moves you use: 1000 minus 5 per move, with a floor of 100. Plan carefully before clicking to maximise your score.

Tip: Start with rows or columns whose clues sum close to the grid width — they have the fewest possible positions and give you the most certain fills right away.`,
  settings: nonogramSettings,
  initialState: (seed: number, settings: NonogramSettingsType) => initialState(seed, settings),
  reducer,
  isTerminal,
  component: Nonogram,
};
