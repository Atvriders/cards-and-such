import type { GamePlugin } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { GomokuMiniState, GomokuMiniAction, GomokuMiniSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { GomokuMini } from "./Game.js";
const settings = { aiStrength: { kind:"enum" as const, label:"AI", options:["easy","hard"] as const, default:"easy" as const } } as const;
type S = SettingsOf<typeof settings>;
export const gomokuMiniPlugin: GamePlugin<GomokuMiniState, GomokuMiniAction, typeof settings> = {
  id:"gomoku-mini", title:"Gomoku Mini", category:"board",
  players:{min:1,max:1,multiplayer:false},
  description:"Classic Gomoku on a compact 9x9 board — get 5 in a row to win!",
  howToPlay:`Gomoku Mini brings the classic Japanese strategy game to a compact 9x9 board. Your goal is to be the first to place five of your marks in an unbroken row — horizontally, vertically, or diagonally.

You play as X and always go first. The AI plays as O. Click any empty cell to place your mark. The AI responds immediately.

Unlike Tic-Tac-Toe, the board is large enough that you must actively build your line while blocking your opponent. A 9x9 grid provides 81 squares, giving room for complex strategies, fork threats, and surprising diagonal runs.

The AI tries to win when possible and block you when you are threatening. Win earns 100 points, draw (full board) earns 50, loss earns 0. Click New Game to start fresh. This is a great introduction to Gomoku strategy before moving on to full 15x15 or 19x19 boards!`,
  settings,
  initialState:(seed:number,s:S)=>initialState(seed,s as GomokuMiniSettings),
  reducer, isTerminal, component:GomokuMini,
};
