import type { GamePlugin } from "../../platform/game-plugin/types.js";
import type { FutoshikiState, FutoshikiAction, FutoshikiSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { Futoshiki } from "./Game.js";

export const futoshikiSettings = {
  size: {
    kind: "enum" as const,
    label: "Grid Size",
    options: ["4", "5", "6"] as const,
    default: "4",
  },
} as const;

export const futoshikiPlugin: GamePlugin<FutoshikiState, FutoshikiAction, typeof futoshikiSettings> = {
  id: "futoshiki",
  title: "Futoshiki",
  category: "board",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Fill an N×N grid with 1–N in every row and column, satisfying all inequality constraints.",
  howToPlay: `Futoshiki is a Latin-square puzzle with inequality constraints. The grid is N×N (4, 5, or 6 depending on your chosen size setting). Your goal is to fill every cell with a number from 1 to N so that each row and each column contains every number exactly once — just like Sudoku rows and columns, but without boxes.

Between some pairs of adjacent cells you will see an inequality sign: < (less than) or > (greater than). These signs must be satisfied: if a < sign sits between two cells, the left (or top) cell's value must be strictly less than the right (or bottom) cell's value.

To play: tap a white cell to select it (it highlights blue), then tap a number button to fill it. Tap the ✕ button to erase the selected cell. Gray cells are pre-filled clues that cannot be changed.

Strategy: start with cells that are already heavily constrained — cells adjacent to many inequality signs or that appear in nearly complete rows or columns. Cells forced to be the maximum (N) or minimum (1) by a chain of inequalities can often be placed immediately.

Grid size: 4×4 is easiest, 5×5 medium, 6×6 hardest.

Score = max(100, 1000 − moves × 5).`,
  settings: futoshikiSettings,
  initialState: (seed: number, s: FutoshikiSettings) => initialState(seed, s),
  reducer,
  isTerminal,
  hint: (s: any) => { const p = (s as any).phase; if (p === "done" || p === "gameover" || p === "ended" || p === "finished" || (s as any).gameOver || (s as any).won || (s as any).complete || (s as any).isComplete) return null; return { selector: ".futoshikiviolet-num-btn", pulses: 3 }; },
  component: Futoshiki,
};
