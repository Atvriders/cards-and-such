import { lazy } from "react";
import type * as React from "react";
import type { GamePlugin } from "../../platform/game-plugin/types.js";
import type { KenKenState, KenKenAction, KenKenSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
const KenKen = /* @__PURE__ */ lazy(() => import("./Game.js").then((mod) => ({ default: mod.KenKen as unknown as React.ComponentType<unknown> })));
export const kenkenSettings = {
  size: {
    kind: "enum" as const,
    label: "Grid Size",
    options: ["4", "5", "6"] as const,
    default: "4",
  },
} as const;

export const kenkenPlugin: GamePlugin<KenKenState, KenKenAction, typeof kenkenSettings> = {
  id: "kenken",
  title: "KenKen",
  category: "board",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Like Sudoku but cells are grouped into 'cages' with arithmetic targets. Fill the grid satisfying both the Latin-square and cage constraints.",
  howToPlay: `KenKen (also called Calcudoku) is a number puzzle that combines Sudoku-style Latin squares with arithmetic. The N×N grid is divided into outlined groups called cages. Each cage shows a target number and an operation symbol (+, −, ×, ÷).

Your goal: fill every cell with a digit from 1 to N such that each row and each column contains every digit from 1 to N exactly once (like Sudoku), and the digits in each cage, when combined using the cage's operation, produce the cage's target number.

For subtraction and division cages (usually 2 cells), the operation is applied in whatever order gives the target (i.e. |a − b| = target, or max÷min = target). For a cage showing just a number with no operation, the single cell must equal that number.

Click a cell to select it (highlighted blue), then press a digit key or click a digit button to enter your answer. Errors — duplicate digits in a row or column, or a completed cage that doesn't match its target — are highlighted in red.

Strategy tip: single-cell cages give you free digits to anchor the puzzle. Two-cell cages with small targets (e.g. "1−") have very few possibilities. Use row and column constraints together with cage constraints to eliminate candidates.`,
  settings: kenkenSettings,
  initialState: (seed: number, settings: KenKenSettings) => initialState(seed, settings),
  reducer,
  isTerminal,
  hint: (s: any) => { const p = (s as any).phase; if (p === "gameover" || p === "done" || p === "ended" || (s as any).gameOver || (s as any).won || (s as any).isWon || (s as any).isComplete || (s as any).complete) return null; return { selector: '[data-testid="hint-target-kenken-action"]', pulses: 3 }; },
  component: KenKen,
};
