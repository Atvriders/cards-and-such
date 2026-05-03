import type { GamePlugin } from "../../platform/game-plugin/types.js";
import type { MiracleSudokuMiniState, MiracleSudokuMiniAction, MiracleSudokuMiniSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { MiracleSudokuMiniGame } from "./Game.js";
const settings = { dummy: { kind: "boolean" as const, label: "dummy", default: false } } as const;
export const miracleSudokuMiniPlugin: GamePlugin<MiracleSudokuMiniState, MiracleSudokuMiniAction, typeof settings> = {
  id: "miracle-sudoku-mini",
  title: "Miracle Sudoku Mini",
  category: "board",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Miracle Sudoku adds anti-king and anti-knight constraints: no two cells a king's or knight's chess move apart may share a digit. In this 4x4 mini, fill 1-4 per row/column with those extra rules.",
  howToPlay: "Miracle Sudoku Mini is a 4x4 logic challenge. Each row and column must contain digits 1-4 with no repeats — but two extra constraints make it miraculous.\n\nAnti-king: no two cells a king's chess move apart (orthogonally or diagonally adjacent) may share the same digit. Anti-knight: no two cells a knight's L-shaped move apart may share a digit either. These constraints often force the entire solution from a single given digit.\n\nYou'll see a partially filled grid and a highlighted target cell with four candidate digits. Reason through the constraints — check rows, columns, neighbors, and knight reaches — then click the digit that legally belongs.\n\nSix puzzles per round, one point each, and your final score scales by speed. Submit a guess and the correct answer reveals; press Next to continue. If you've solved Miracle Sudoku before you'll feel right at home; if not, prepare to see how a single clue can unlock everything.",
  settings,
  initialState: (seed: number) => initialState(seed, { dummy: true } as MiracleSudokuMiniSettings),
  reducer,
  isTerminal,
  hint: (s: any) => { const p = (s as any).phase; if (p === "done" || p === "gameover" || p === "ended" || p === "finished" || (s as any).gameOver || (s as any).won || (s as any).complete || (s as any).isComplete) return null; return { selector: ".miraclegold-num", pulses: 3 }; },
  component: MiracleSudokuMiniGame,
};
