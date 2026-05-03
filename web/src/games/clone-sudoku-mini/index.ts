import { lazy } from "react";
import type * as React from "react";
import type { GamePlugin, HintTarget, SettingsOf } from "../../platform/game-plugin/types.js";
import type { CloneSudokuMiniState, CloneSudokuMiniAction, CloneSudokuMiniSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
const CloneSudokuMiniGame = /* @__PURE__ */ lazy(() => import("./Game.js").then((mod) => ({ default: mod.CloneSudokuMiniGame as unknown as React.ComponentType<unknown> })));
const settings = {
  puzzles: { kind: "enum" as const, label: "Puzzles", options: ["8"] as const, default: "8" as const },
} as const;
type S = SettingsOf<typeof settings>;

export const cloneSudokuMiniPlugin: GamePlugin<CloneSudokuMiniState, CloneSudokuMiniAction, typeof settings> = {
  id: "clone-sudoku-mini",
  title: "Clone Sudoku Mini",
  category: "board",
  players: { min: 1, max: 1, multiplayer: false },
  description: `4×4 Clone Sudoku: cloned regions must contain identical values.`,
  howToPlay: `Clone Sudoku is a Sudoku variant where two or more "cloned" regions must contain identical values in their corresponding cells. Like classic Sudoku, every row, column, and box still must contain 1-N. The clone constraint adds extra deduction power.

In this 4×4 solo adaptation each puzzle shows a partially-filled 4×4 grid with two cloned 1×2 regions and asks which digit fills a specific empty cell. Pick from 1, 2, 3, 4.

Eight puzzles per session, 100 points each (800 max).

Tips: clone regions act as bidirectional information — solving the clone fills the source and vice versa. Always cross-check rows, columns, AND clone constraints. The 4×4 size means each row/column/box uses 1-4 with no repeats. A standard solving approach: find a unique-candidate cell, propagate through clones, repeat.`,
  settings,
  initialState: (seed: number, s: S) => initialState(seed, s as CloneSudokuMiniSettings),
  reducer,
  isTerminal,
  
  hint: (state: CloneSudokuMiniState): HintTarget | null => state.phase === "playing" ? { selector: '[data-testid="hint-target-clone-sudoku-mini-answer-0"]', pulses: 3 } : null,component: CloneSudokuMiniGame,
};
