import { lazy } from "react";
import type * as React from "react";
import type { GamePlugin, HintTarget } from "../../platform/game-plugin/types.js";
import type { Sudoku25State, Sudoku25StateAction, Sudoku25Settings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
const Sudoku25Game = /* @__PURE__ */ lazy(() => import("./Game.js").then((mod) => ({ default: mod.Sudoku25Game as unknown as React.ComponentType<unknown> })));
const settings = { dummy: { kind: "boolean" as const, label: "dummy", default: false } } as const;
export const sudoku25Plugin: GamePlugin<Sudoku25State, Sudoku25StateAction, typeof settings> = {
  id: "sudoku-25",
  title: "Sudoku 25x25",
  category: "board",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Massive 25x25 sudoku with 5x5 boxes and digits 1 to 25 (or A to Y).",
  howToPlay: "Sudoku 25x25 is the supersized cousin of standard Sudoku. The grid is 25 cells wide and tall, divided into twenty-five 5x5 boxes. Each row, each column, and each box must contain each of 25 unique symbols (typically 1 to 25 or letters A to Y).\n\nA full 25x25 grid is daunting — completing one can take hours. This puzzle quiz extracts a single deduction from a partially-solved grid and presents four candidate digits. You apply the row, column, and 5x5 box rules to pin the answer.\n\nSix questions per round; 100 points per correct answer with a small streak bonus. Wrong picks reveal the right digit. The questions focus on the most common solving techniques: naked singles, hidden singles, and box-line intersections. Even at 25x25 these techniques pin many cells. Choose wisely.",
  settings,
  initialState: (seed: number) => initialState(seed, { dummy: true } as Sudoku25Settings),
  reducer,
  isTerminal,
  
  hint: (state: Sudoku25State): HintTarget | null => state.phase === "playing" ? { selector: '[data-testid="hint-target-sudoku-25-answer-0"]', pulses: 3 } : null,component: Sudoku25Game,
};
