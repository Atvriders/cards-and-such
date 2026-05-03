import type { GamePlugin, HintTarget } from "../../platform/game-plugin/types.js";
import type { CenterDotSudokuState, CenterDotSudokuAction, CenterDotSudokuSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { CenterDotSudokuGame } from "./Game.js";
const settings = { dummy: { kind: "boolean" as const, label: "dummy", default: false } } as const;
export const centerDotSudokuPlugin: GamePlugin<CenterDotSudokuState, CenterDotSudokuAction, typeof settings> = {
  id: "center-dot-sudoku",
  title: "Center-Dot Sudoku",
  category: "board",
  players: { min: 1, max: 1, multiplayer: false },
  description: "The center cell of each 3x3 box is part of an extra region that must also contain digits 1-9 once.",
  howToPlay: "Center-Dot Sudoku adds one extra ninth region: the nine center cells of the standard 3x3 boxes. Those center-dot cells, taken together, must collectively contain each digit 1-9 exactly once.\n\nStandard Sudoku rules apply: rows, columns, boxes, and now the center-dot region. Since each center-dot cell sits in a different box, the rule does not conflict with box uniqueness — it just adds one more layer of \"this set of nine must be a permutation of 1-9.\"\n\nEach puzzle shows a small example with the center cells marked. A target cell appears on the center-dot region with four candidate digits. Apply the center-dot uniqueness, row, and column rules to identify the correct value.\n\nSix puzzles per round; correct answers earn 100 points plus a speed bonus. Wrong picks reveal the correct value. Center-Dot is approachable and a great gateway into \"extra-region\" Sudoku variants.",
  settings,
  initialState: (seed: number) => initialState(seed, { dummy: true } as CenterDotSudokuSettings),
  reducer,
  isTerminal,
  
  hint: (state: CenterDotSudokuState): HintTarget | null => state.phase === "playing" ? { selector: '[data-testid="hint-target-center-dot-sudoku-answer-0"]', pulses: 3 } : null,component: CenterDotSudokuGame,
};
