import type { GamePlugin, SettingsOf } from "../../platform/game-plugin/types.js";
import type { ChaosSudokuMiniState, ChaosSudokuMiniAction, ChaosSudokuMiniSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { ChaosSudokuMiniGame } from "./Game.js";

const settings = {
  puzzles: { kind: "enum" as const, label: "Puzzles", options: ["8"] as const, default: "8" as const },
} as const;
type S = SettingsOf<typeof settings>;

export const chaosSudokuMiniPlugin: GamePlugin<ChaosSudokuMiniState, ChaosSudokuMiniAction, typeof settings> = {
  id: "chaos-sudoku-mini",
  title: "Chaos Sudoku Mini",
  category: "board",
  players: { min: 1, max: 1, multiplayer: false },
  description: `4×4 chaos-construction Sudoku: deduce the box layout AND fill the digit.`,
  howToPlay: `Chaos Construction Sudoku is a modern variant where the 3×3 (or 2×2) boxes are not pre-printed — instead, the boxes themselves must be deduced from the clues. The classic constraints (each row, column, and box contains 1-N) all apply, but the box shapes are unknown.

In this 4×4 solo adaptation each puzzle gives partial digit clues and partial box-membership info, then asks for either a box assignment or a digit. Pick from the choices.

Eight puzzles per session, 100 points each (800 max).

Tips: Chaos Construction puzzles famously appeared on Cracking the Cryptic. Look for cells whose row/column digit is unique — that locks the digit, which in turn forces box membership (since boxes can't repeat). Conversely, regions of three connected same-row-or-column cells cannot all be the same box. Boxes must each have exactly N cells; track totals.`,
  settings,
  initialState: (seed: number, s: S) => initialState(seed, s as ChaosSudokuMiniSettings),
  reducer,
  isTerminal,
  component: ChaosSudokuMiniGame,
};
