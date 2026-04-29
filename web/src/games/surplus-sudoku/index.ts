import type { GamePlugin } from "../../platform/game-plugin/types.js";
import type { SurplusSudokuState, SurplusSudokuStateAction, SurplusSudokuSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { SurplusSudokuGame } from "./Game.js";
const settings = { dummy: { kind: "boolean" as const, label: "dummy", default: false } } as const;
export const surplusSudokuPlugin: GamePlugin<SurplusSudokuState, SurplusSudokuStateAction, typeof settings> = {
  id: "surplus-sudoku",
  title: "Surplus Sudoku",
  category: "board",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Extra redundant givens guide solver into specific path.",
  howToPlay: "Surplus Sudoku is a teaching variant where puzzle designers include more givens than strictly necessary. A standard Sudoku has minimum 17 givens; Surplus often has 30 or more. The redundancy isn't sloppy — it's intentional, designed to guide the solver into using a specific solving technique (like X-Wing or Swordfish) rather than brute force.\n\nFor learners, Surplus Sudoku shows what \"good moves\" look like by making them required. Once you place enough digits to trigger the intended technique, the puzzle resolves with a satisfying flash of insight.\n\nThis quiz presents six Surplus Sudoku puzzles, each highlighting a cell whose deduction requires applying the technique implicitly. Each shows four candidates. Apply standard Sudoku rules and look for the redundant-but-helpful pattern. Six puzzles per round; 100 points per correct answer plus time bonus. Surplus is forgiving — even sloppy scanning often pins the answer. Pick the digit that follows from the rich constraint set.",
  settings,
  initialState: (seed: number) => initialState(seed, { dummy: true } as SurplusSudokuSettings),
  reducer,
  isTerminal,
  component: SurplusSudokuGame,
};
