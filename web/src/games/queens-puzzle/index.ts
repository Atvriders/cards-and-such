import type { GamePlugin } from "../../platform/game-plugin/types.js";
import type { QueensPuzzleState, QueensPuzzleAction, QueensPuzzleSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { QueensPuzzleGame } from "./Game.js";
const settings = { dummy: { kind: "boolean" as const, label: "dummy", default: false } } as const;
export const queensPuzzlePlugin: GamePlugin<QueensPuzzleState, QueensPuzzleAction, typeof settings> = {
  id: "queens-puzzle",
  title: "Queens Puzzle",
  category: "board",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Place N queens on N×N board so none attack each other.",
  howToPlay: "Queens Puzzle is a chess-derived classic — place N queens on an N×N board so that no two queens attack each other. Queens attack along rows, columns, and both diagonals.\n\nFor N=4, the only solutions (up to symmetry) place queens at columns 2, 4, 1, 3 (rows 1-4 respectively). Larger N has more solutions but always requires careful diagonal management.\n\nIn this mini version each puzzle shows a small grid with one or two queens placed. The prompt asks where the next queen can safely go without attacking existing queens.\n\nSix puzzles per round, scoring 100 each with a 10-point time bonus per remaining second. Wrong picks reveal the right cell.\n\nQueens-style placement is a foundational backtracking exercise — one of the first programs every CS student writes. Solving by hand teaches you to scan rows, columns, and both diagonals simultaneously. After a few puzzles, the patterns become reflex: avoid queens' rows, columns, then both diagonals (slope +1 and slope -1).",
  settings,
  initialState: (seed: number) => initialState(seed, { dummy: true } as QueensPuzzleSettings),
  reducer,
  isTerminal,
  component: QueensPuzzleGame,
};
