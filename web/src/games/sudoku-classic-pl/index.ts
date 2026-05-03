import type { GamePlugin, HintTarget } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { SudokuClassicPlState, SudokuClassicPlAction, SudokuClassicPlSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { SudokuClassicPlGame } from "./Game.js";
const settings = { questions: { kind:"enum" as const, label:"Questions", options:["10"] as const, default:"10" as const } } as const;
type S = SettingsOf<typeof settings>;
export const sudokuClassicPlPlugin: GamePlugin<SudokuClassicPlState, SudokuClassicPlAction, typeof settings> = {
  id:"sudoku-classic-pl", title:"Sudoku (Classic 9×9)", category:"board",
  players:{ min:1, max:1, multiplayer:false },
  description:"Trivia about classic 9×9 Sudoku.",
  howToPlay:"Sudoku Classic Trivia is a ten-question quiz about Sudoku, the worldwide-popular 9×9 number-placement puzzle. The puzzle is a 9×9 grid divided into nine 3×3 boxes. Some cells are pre-filled; the solver must fill in the remaining cells with digits 1-9 so that each row, column, and 3×3 box contains each digit exactly once. A well-formed Sudoku puzzle has exactly one solution. Sudoku was popularized worldwide in the early 2000s by Wayne Gould and the publication The Times of London. Each question tests rules, history, and key Sudoku terminology. Tap an answer and Submit; correct answers earn 100 base points plus 10 per second remaining on the 15-second timer. Wrong answers reveal the correct option. After ten questions your final score is shown.",
  settings,
  initialState:(seed:number,s:S)=>initialState(seed,s as SudokuClassicPlSettings),
  reducer,isTerminal,hint: (state: SudokuClassicPlState): HintTarget | null => state.phase === "playing" ? { selector: '[data-testid="hint-target-sudoku-classic-pl-answer-0"]', pulses: 3 } : null, component:SudokuClassicPlGame,
};
