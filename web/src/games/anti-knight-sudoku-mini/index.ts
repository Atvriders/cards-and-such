import type { GamePlugin, HintTarget } from "../../platform/game-plugin/types.js";
import type { AntiKnightSudokuMiniState, AntiKnightSudokuMiniAction, AntiKnightSudokuMiniSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { AntiKnightSudokuMiniGame } from "./Game.js";
const settings = { dummy: { kind: "boolean" as const, label: "dummy", default: false } } as const;
export const antiKnightSudokuMiniPlugin: GamePlugin<AntiKnightSudokuMiniState, AntiKnightSudokuMiniAction, typeof settings> = {
  id: "anti-knight-sudoku-mini",
  title: "Anti-Knight Sudoku Mini",
  category: "board",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Standard 4x4 Sudoku plus the rule: no two cells a chess knight's L-move apart may share a digit.",
  howToPlay: "Anti-Knight Sudoku Mini bolts a chess-piece constraint onto a 4x4 Latin square. Beyond the usual row and column rules, no two cells separated by a knight's L-shaped move (two in one direction, one perpendicular) may contain the same digit.\n\nThe knight's reach in a 4x4 grid is generous — most cells attack at least two others — so a single given digit can rule itself out from up to four other locations simultaneously. That makes solving feel like X-ray vision after a few placements.\n\nYou'll see a grid with some digits filled and a target cell highlighted. Pick the value that satisfies all rules: row, column, and anti-knight.\n\nSix puzzles per round, one point each, with a speed bonus on top. Wrong answers earn zero but reveal the correct choice for next time. Anti-Knight is a great gateway into the world of chess-constraint Sudoku variants like Anti-King and Miracle Sudoku.",
  settings,
  initialState: (seed: number) => initialState(seed, { dummy: true } as AntiKnightSudokuMiniSettings),
  reducer,
  isTerminal,
  
  hint: (state: AntiKnightSudokuMiniState): HintTarget | null => state.phase === "playing" ? { selector: '[data-testid="hint-target-anti-knight-sudoku-mini-answer-0"]', pulses: 3 } : null,component: AntiKnightSudokuMiniGame,
};
