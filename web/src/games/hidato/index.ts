import type { GamePlugin, HintTarget } from "../../platform/game-plugin/types.js";
import type { HidatoState, HidatoAction, HidatoSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { Hidato } from "./Game.js";

export const hidatoSettings = {
  difficulty: {
    kind: "enum" as const,
    label: "Difficulty",
    options: ["easy", "medium", "hard"] as const,
    default: "easy",
  },
} as const;

export const hidatoPlugin: GamePlugin<HidatoState, HidatoAction, typeof hidatoSettings> = {
  id: "hidato",
  title: "Hidato",
  category: "board",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Fill the grid with consecutive numbers 1 to N so each next number is king-adjacent to the previous.",
  howToPlay: `Hidato (also called Hidoku) is a number-path puzzle. The grid contains a handful of pre-filled numbers, including 1 and the maximum number N. Your task is to fill every remaining cell with an integer from 1 to N so that the complete sequence 1, 2, 3, … N forms a connected path where each consecutive pair of numbers occupies adjacent cells — adjacency includes all eight directions (horizontally, vertically, and diagonally).

To play: click any empty cell to select it (it highlights blue). Then type a number into the input box and press Place (or Enter). The number must be between 1 and N. If that number is already placed elsewhere, it moves to the new cell. To erase a cell, select it and press Clear.

You win when every cell in the grid is filled with the correct number and every consecutive pair is king-adjacent.

Strategy tips: start from the given numbers and work outward. If a given number has only one or two neighbors that could plausibly connect to the next number, you can immediately deduce the path. Corners and edges of the grid are especially constraining.

Difficulty controls grid size: Easy is 5×5, Medium is 6×6, Hard is 7×7.

Score = max(100, 1000 − moves × 5).`,
  settings: hidatoSettings,
  initialState: (seed: number, s: HidatoSettings) => initialState(seed, s),
  reducer,
  isTerminal,
  hint: (): HintTarget | null => (typeof document !== "undefined" && document.querySelector(".hidatosnake-grid")) ? { selector: ".hidatosnake-grid", pulses: 3 } : null,
  component: Hidato,
};
