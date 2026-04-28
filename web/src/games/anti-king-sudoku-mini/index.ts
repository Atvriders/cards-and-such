import type { GamePlugin } from "../../platform/game-plugin/types.js";
import type { AntiKingSudokuMiniState, AntiKingSudokuMiniAction, AntiKingSudokuMiniSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { AntiKingSudokuMiniGame } from "./Game.js";
const settings = { dummy: { kind: "boolean" as const, label: "dummy", default: false } } as const;
export const antiKingSudokuMiniPlugin: GamePlugin<AntiKingSudokuMiniState, AntiKingSudokuMiniAction, typeof settings> = {
  id: "anti-king-sudoku-mini",
  title: "Anti-King Sudoku Mini",
  category: "board",
  players: { min: 1, max: 1, multiplayer: false },
  description: "4x4 Sudoku with the added rule: no two cells a king's chess move apart (orthogonally or diagonally adjacent) may share a digit.",
  howToPlay: "Anti-King Sudoku Mini extends standard 4x4 Sudoku with a chess-king constraint. Two cells touching at a side or corner — anywhere a king could move in one step — must not share a digit.\n\nIn a 4x4 grid that means each cell forbids its value from up to eight neighbors. Combined with row and column uniqueness, the puzzle becomes nearly solved by a single given. Identical digits on a diagonal? Not allowed. Pairs touching corners? Forbidden.\n\nEach puzzle gives you a partial grid, marks a target cell, and offers four candidate digits. Use the row, column, and anti-king rules to find the unique legal value.\n\nSix puzzles per round, with each correct answer earning 100 points plus a speed bonus. The right answer is revealed after you submit. Anti-King is one of the easier Sudoku variants once you learn to spot diagonal touches — and it's a great mental warm-up for harder Miracle Sudoku puzzles.",
  settings,
  initialState: (seed: number) => initialState(seed, { dummy: true } as AntiKingSudokuMiniSettings),
  reducer,
  isTerminal,
  component: AntiKingSudokuMiniGame,
};
