import { lazy } from "react";
import type * as React from "react";
import type { GamePlugin, HintTarget } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { Nonogram5x5State, Nonogram5x5Action } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
const Nonogram5x5Game = /* @__PURE__ */ lazy(() => import("./Game.js").then((mod) => ({ default: mod.Nonogram5x5Game as unknown as React.ComponentType<unknown> })));
const nonogram5x5Settings = {
  difficulty: {
    kind: "enum" as const,
    label: "Difficulty",
    options: ["easy", "medium", "hard"] as const,
    default: "medium" as const,
  },
} as const;

type S = SettingsOf<typeof nonogram5x5Settings>;

export const nonogram5x5Plugin: GamePlugin<Nonogram5x5State, Nonogram5x5Action, typeof nonogram5x5Settings> = {
  id: "nonogram-5x5",
  title: "Nonogram 5×5",
  category: "board",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Quick 5×5 Picross puzzle — fill the grid using row and column clues.",
  howToPlay: `Nonogram 5×5 is a compact Picross puzzle played on a 5-by-5 grid. Each row and column has a set of number clues printed alongside it. The numbers tell you the lengths of consecutive filled-cell runs in that line, in order from left to right (or top to bottom).

For example, a row clue of "2 1" means there is a run of exactly 2 filled cells, then at least one empty cell, then a run of exactly 1 filled cell — somewhere in that row.

Left-click any cell to fill it (shown in blue). Left-click a filled cell again to clear it. Shift-click or right-click to mark a cell with × to remind yourself it must be empty.

Work through the rows and columns, deducing which cells must be filled or empty based on the clues. When every filled cell in your grid matches the hidden solution exactly, the puzzle is complete.

Three difficulty levels are available: Easy uses sparse patterns with few filled cells; Medium has moderate density; Hard features intricate patterns that require careful logic.

Score starts at 500 and decreases by 5 for each move made, with a floor of 100. Try to solve the puzzle in as few moves as possible.

Tip: Start with lines whose clue numbers sum closest to 5 — those lines are tightly constrained and give you immediate certain fills.`,
  settings: nonogram5x5Settings,
  initialState: (seed: number, settings: S) => initialState(seed, settings),
  reducer,
  isTerminal,
  hint: (): HintTarget | null => (typeof document !== "undefined" && document.querySelector(".nonogram5-grid")) ? { selector: ".nonogram5-grid", pulses: 3 } : null,
  component: Nonogram5x5Game,
};
