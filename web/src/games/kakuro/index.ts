import type { GamePlugin } from "../../platform/game-plugin/types.js";
import type { KakuroState, KakuroAction, KakuroSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { Kakuro } from "./Game.js";

export const kakuroSettings = {
  difficulty: {
    kind: "enum" as const,
    label: "Difficulty",
    options: ["easy", "medium", "hard"] as const,
    default: "easy",
  },
} as const;

export const kakuroPlugin: GamePlugin<KakuroState, KakuroAction, typeof kakuroSettings> = {
  id: "kakuro",
  title: "Kakuro",
  category: "board",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Crossword-style number puzzle: fill runs of cells so each sums to its clue, with no repeated digits.",
  howToPlay: `Kakuro is a crossword-style number puzzle. The grid contains black cells and white cells. Black cells may display clue numbers: a number in the upper-left triangle is a "down" clue for the white cells below; a number in the lower-right triangle is an "across" clue for the white cells to the right.

Your goal is to fill every white cell with a digit from 1 to 9 so that each run of consecutive white cells sums exactly to its clue, and no digit repeats within the same run.

Click a white cell to select it (highlighted blue), then click a digit button or press 1–9 on your keyboard to enter a number. Press Backspace, Delete, or the Clear button to erase a cell. Cells with errors (duplicate digits in a run, or a completed run whose sum is wrong) turn red.

Strategy tip: start with runs that have only two cells — the possible digit pairs are limited. For example, a two-cell run with clue 3 can only be {1, 2}. Use the intersecting down/across constraints to narrow choices further.

Difficulty controls puzzle size and complexity. Easy puzzles are small with few runs; Hard puzzles are larger with more intersecting constraints.`,
  settings: kakuroSettings,
  initialState: (seed: number, settings: KakuroSettings) => initialState(seed, settings),
  reducer,
  isTerminal,
  component: Kakuro,
};
