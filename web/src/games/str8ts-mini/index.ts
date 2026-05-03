import type { GamePlugin, HintTarget } from "../../platform/game-plugin/types.js";
import type { Str8tsMiniState, Str8tsMiniAction, Str8tsMiniSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { Str8tsMiniGame } from "./Game.js";
const settings = { dummy: { kind: "boolean" as const, label: "dummy", default: false } } as const;
export const str8tsMiniPlugin: GamePlugin<Str8tsMiniState, Str8tsMiniAction, typeof settings> = {
  id: "str8ts-mini",
  title: "Str8ts Mini",
  category: "board",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Fill white cells so each row/column has unique digits, and white cells in each unbroken run form a straight (consecutive set, any order).",
  howToPlay: "Str8ts Mini uses a Sudoku-like grid with some black blocking cells. Like Sudoku, each row and column contains unique digits — but the cells form a \"straight\" (a contiguous run of consecutive digits in any order). Black cells break runs.\n\nA run of three white cells could hold {2,3,4}, {3,4,5}, or any consecutive triple. A run of five could be {1,2,3,4,5} through {5,6,7,8,9}. Black cells may carry \"clue\" digits which influence neighboring runs but don't belong to any straight themselves.\n\nEach puzzle shows a small example with a marked target cell on a white run, and four candidate digits. Apply the row/column uniqueness and the contiguous-set rule to find the unique answer.\n\nSix puzzles per round; 100 points per correct answer plus a speed bonus. Wrong picks reveal the correct digit. Str8ts is a fresh take on Sudoku — once you understand \"every run is a straight,\" the deductions feel natural.",
  settings,
  initialState: (seed: number) => initialState(seed, { dummy: true } as Str8tsMiniSettings),
  reducer,
  isTerminal,
  
  hint: (state: Str8tsMiniState): HintTarget | null => state.phase === "playing" ? { selector: '[data-testid="hint-target-str8ts-mini-answer-0"]', pulses: 3 } : null,component: Str8tsMiniGame,
};
