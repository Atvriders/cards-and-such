import type { GamePlugin, HintTarget } from "../../platform/game-plugin/types.js";
import type { AsteriskSudokuState, AsteriskSudokuAction, AsteriskSudokuSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { AsteriskSudokuGame } from "./Game.js";
const settings = { dummy: { kind: "boolean" as const, label: "dummy", default: false } } as const;
export const asteriskSudokuPlugin: GamePlugin<AsteriskSudokuState, AsteriskSudokuAction, typeof settings> = {
  id: "asterisk-sudoku",
  title: "Asterisk Sudoku",
  category: "board",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Standard Sudoku with an extra constraint: nine cells forming a star pattern must contain digits 1-9 once.",
  howToPlay: "Asterisk Sudoku adds an extra ninth region shaped like a star — nine specific cells scattered around the grid (typically at the center of each box and the four mid-edge boxes). Those nine asterisk cells must collectively contain digits 1-9, each exactly once.\n\nStandard Sudoku rules apply alongside the asterisk: rows, columns, boxes, plus the star. Because the star samples one cell per box, no two asterisk cells share a box constraint, so the rule effectively merges nine separate single-cell constraints into one big set.\n\nEach puzzle shows a partial grid with the asterisk cells marked, a target cell on the asterisk, and four candidate digits. Apply the star uniqueness rule with row/column logic to choose the correct value.\n\nSix puzzles per round, with each correct answer earning 100 points plus a 10-point-per-second time bonus. Wrong picks reveal the correct digit. The asterisk's lacy shape rewards careful tracking of which star cells are filled.",
  settings,
  initialState: (seed: number) => initialState(seed, { dummy: true } as AsteriskSudokuSettings),
  reducer,
  isTerminal,
  
  hint: (state: AsteriskSudokuState): HintTarget | null => state.phase === "playing" ? { selector: '[data-testid="hint-target-asterisk-sudoku-answer-0"]', pulses: 3 } : null,component: AsteriskSudokuGame,
};
