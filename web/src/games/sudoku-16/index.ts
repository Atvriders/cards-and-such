import { lazy } from "react";
import type * as React from "react";
import type { GamePlugin, HintTarget } from "../../platform/game-plugin/types.js";
import type { Sudoku16State, Sudoku16StateAction, Sudoku16Settings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
const Sudoku16Game = /* @__PURE__ */ lazy(() => import("./Game.js").then((mod) => ({ default: mod.Sudoku16Game as unknown as React.ComponentType<unknown> })));
const settings = { dummy: { kind: "boolean" as const, label: "dummy", default: false } } as const;
export const sudoku16Plugin: GamePlugin<Sudoku16State, Sudoku16StateAction, typeof settings> = {
  id: "sudoku-16",
  title: "Sudoku 16x16",
  category: "board",
  players: { min: 1, max: 1, multiplayer: false },
  description: "16x16 sudoku with 4x4 boxes; digits 1 to 16 or hex 0-F.",
  howToPlay: "Sudoku 16x16 (Hexadecimal Sudoku) extends classic Sudoku to a 16-wide grid divided into sixteen 4x4 boxes. Each row, column, and box must contain each of 16 distinct symbols — typically the hex digits 0 to F or numbers 1 to 16.\n\nThe puzzle is significantly harder than the 9x9 standard because the search space grows quadratically. However, the same solving techniques apply: scan for naked singles, look for hidden singles in rows, columns, and boxes, and chase intersection patterns.\n\nSix puzzles per round; 100 points per correct answer with a time bonus. Each question shows a small text-rendered slice of the grid and asks for one missing digit, giving four hex candidates. Wrong picks reveal the correct value. Sudoku 16x16 lovers will appreciate the puzzle progression here — the questions move from basic naked singles into intersection deductions. Choose the right hex digit.",
  settings,
  initialState: (seed: number) => initialState(seed, { dummy: true } as Sudoku16Settings),
  reducer,
  isTerminal,
  
  hint: (state: Sudoku16State): HintTarget | null => state.phase === "playing" ? { selector: '[data-testid="hint-target-sudoku-16-answer-0"]', pulses: 3 } : null,component: Sudoku16Game,
};
