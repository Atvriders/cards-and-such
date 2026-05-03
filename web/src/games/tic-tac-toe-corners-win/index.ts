import { lazy } from "react";
import type * as React from "react";
import type { GamePlugin, HintTarget } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { TicTacToeCornersWinState, TicTacToeCornersWinAction, TicTacToeCornersWinSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
const TicTacToeCornersWin = /* @__PURE__ */ lazy(() => import("./Game.js").then((mod) => ({ default: mod.TicTacToeCornersWin as unknown as React.ComponentType<unknown> })));
const settings = { aiStrength: { kind:"enum" as const, label:"AI", options:["easy","hard"] as const, default:"easy" as const } } as const;
type S = SettingsOf<typeof settings>;
export const ticTacToeCornersWinPlugin: GamePlugin<TicTacToeCornersWinState, TicTacToeCornersWinAction, typeof settings> = {
  id:"tic-tac-toe-corners-win", title:"Corners Win Tic-Tac-Toe", category:"board",
  players:{min:1,max:1,multiplayer:false},
  description:"A Tic-Tac-Toe variant where controlling 3 of the 4 corners wins — not 3-in-a-row!",
  howToPlay:`Corners Win Tic-Tac-Toe plays on a standard 3x3 grid, but the win condition is different. Instead of getting three-in-a-row, you win by controlling at least 3 of the 4 corner squares (top-left, top-right, bottom-left, bottom-right).

You play as X and go first against the AI (O). Corners are highlighted with gold borders. Both you and the AI will naturally compete for corners, making edge and center squares strategic blockers.

The AI prioritizes corners, so you need to be fast and tactical. If both players each control exactly 2 corners when the board fills, the game is a draw.

Win for 100 points, draw for 50, loss for 0. Click New Game to play again with a fresh board. It is a surprisingly different feel from regular Tic-Tac-Toe — corners become the most precious squares on the board!`,
  settings,
  initialState:(seed:number,s:S)=>initialState(seed,s as TicTacToeCornersWinSettings),
  reducer, isTerminal, hint: (state: TicTacToeCornersWinState): HintTarget | null => state.phase === "playing" ? { selector: '.ttt-board.corners', pulses: 3 } : null, component:TicTacToeCornersWin,
};
