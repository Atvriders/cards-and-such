import type { GamePlugin } from "../../platform/game-plugin/types.js";
import type { ConsecutivePairsSudokuState, ConsecutivePairsSudokuAction, ConsecutivePairsSudokuSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { ConsecutivePairsSudokuGame } from "./Game.js";
const settings = { dummy: { kind: "boolean" as const, label: "dummy", default: false } } as const;
export const consecutivePairsSudokuPlugin: GamePlugin<ConsecutivePairsSudokuState, ConsecutivePairsSudokuAction, typeof settings> = {
  id: "consecutive-pairs-sudoku",
  title: "Consecutive Pairs Sudoku",
  category: "board",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Marked adjacent pairs must be consecutive (differ by 1); unmarked adjacent pairs must NOT be consecutive.",
  howToPlay: "Consecutive Pairs Sudoku flips the Non-Consecutive rule on its head — sometimes. Some pairs of orthogonally adjacent cells are explicitly marked: those marked pairs must contain consecutive digits (differ by exactly 1). Every unmarked adjacent pair, however, must NOT be consecutive.\n\nThis dual rule turns each marked dot into a precise relationship: 1-2, 2-3, 3-4 (or reverse). Unmarked neighbors must instead skip — so 2 next to 4, or 1 next to 3.\n\nEach puzzle shows a small grid with marker dots between certain cells, plus a target cell and four candidates. Use row/column rules along with the consecutive/non-consecutive markings to deduce the unique value.\n\nSix puzzles per round; correct answers earn 100 points plus a time bonus. Wrong answers reveal the right choice for the next puzzle. The mix of \"must\" and \"must not\" relationships makes this variant feel unusually rich for such small grids.",
  settings,
  initialState: (seed: number) => initialState(seed, { dummy: true } as ConsecutivePairsSudokuSettings),
  reducer,
  isTerminal,
  hint: (s: any) => { const p = (s as any).phase; if (p === "done" || p === "gameover" || p === "ended" || p === "finished" || (s as any).gameOver || (s as any).won || (s as any).complete || (s as any).isComplete) return null; return { selector: ".consecutivepairscopper-num", pulses: 3 }; },
  component: ConsecutivePairsSudokuGame,
};
