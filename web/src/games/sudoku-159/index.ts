import { lazy } from "react";
import type * as React from "react";
import type { GamePlugin, HintTarget } from "../../platform/game-plugin/types.js";
import type { Sudoku159State, Sudoku159StateAction, Sudoku159Settings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
const Sudoku159Game = /* @__PURE__ */ lazy(() => import("./Game.js").then((mod) => ({ default: mod.Sudoku159Game as unknown as React.ComponentType<unknown> })));
const settings = { dummy: { kind: "boolean" as const, label: "dummy", default: false } } as const;
export const sudoku159Plugin: GamePlugin<Sudoku159State, Sudoku159StateAction, typeof settings> = {
  id: "sudoku-159",
  title: "159 Sudoku",
  category: "board",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Column 1 records position of 1s; col 5 records position of 5s; col 9 of 9s.",
  howToPlay: "159 Sudoku is a Sudoku variant with a meta-constraint linking columns. The cell in row R column 1 contains the column position of the digit 1 in row R. Similarly, column 5 records the column position of 5, and column 9 records the column position of 9. Each row's columns 1, 5, and 9 act as pointers into that same row.\n\nThis self-referential constraint creates fascinating chains: knowing the digit at (R, 1) tells you where 1 sits in row R, which constrains the rest of the row.\n\nThis quiz presents six puzzles, each showing a partial 9x9 grid and asking for one cell's value. The key trick is checking the 159 columns first — they point to where the named digits live, which often pins down the question cell directly. Six puzzles per round; 100 points per correct answer plus time bonus. Pick the digit honoring both standard Sudoku rules and the 159 pointer constraint.",
  settings,
  initialState: (seed: number) => initialState(seed, { dummy: true } as Sudoku159Settings),
  reducer,
  isTerminal,
  
  hint: (state: Sudoku159State): HintTarget | null => state.phase === "playing" ? { selector: '[data-testid="hint-target-sudoku-159-answer-0"]', pulses: 3 } : null,component: Sudoku159Game,
};
