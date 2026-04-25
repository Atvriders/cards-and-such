import type { GamePlugin } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { TicTacToeLargeState, TicTacToeLargeAction, TicTacToeLargeSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { TicTacToeLarge } from "./Game.js";
const settings = { aiStrength: { kind:"enum" as const, label:"AI Strength", options:["easy","hard"] as const, default:"easy" as const } } as const;
type S = SettingsOf<typeof settings>;
export const ticTacToeLargePlugin: GamePlugin<TicTacToeLargeState, TicTacToeLargeAction, typeof settings> = {
  id:"tic-tac-toe-large", title:"Tic-Tac-Toe Large", category:"board",
  players:{min:1,max:1,multiplayer:false},
  description:"Classic Tic-Tac-Toe expanded to a 5x5 board — get 4 in a row to win!",
  howToPlay:`Tic-Tac-Toe Large plays like the classic game but on a 5x5 grid. You need to get four of your marks in a row — horizontally, vertically, or diagonally — to win. The extra space means longer games and more strategic depth.

You play as X and go first. The AI plays as O. Click any empty cell to place your mark. The AI responds immediately.

Winning earns 100 points, a draw earns 50 points, and a loss earns 0. Click New Game after the game ends to play again.

With 25 cells and a 4-in-a-row requirement, the game feels much more like strategy than luck. Corners and center positions are valuable. Watch out for the AI threatening to complete a row — block it while building your own winning lines. How many games can you win in a row?`,
  settings,
  initialState:(seed:number,s:S)=>initialState(seed,s as TicTacToeLargeSettings),
  reducer, isTerminal, component:TicTacToeLarge,
};
