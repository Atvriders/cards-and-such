import { lazy } from "react";
import type * as React from "react";
import type { GamePlugin, HintTarget } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { TicTacToe3InRowState, TicTacToe3InRowAction, TicTacToe3InRowSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
const TicTacToe3InRow = /* @__PURE__ */ lazy(() => import("./Game.js").then((mod) => ({ default: mod.TicTacToe3InRow as unknown as React.ComponentType<unknown> })));
const settings = { aiStrength: { kind:"enum" as const, label:"AI", options:["easy","hard"] as const, default:"easy" as const } } as const;
type S = SettingsOf<typeof settings>;
export const ticTacToe3InRowPlugin: GamePlugin<TicTacToe3InRowState, TicTacToe3InRowAction, typeof settings> = {
  id:"tic-tac-toe-3-in-row", title:"3-in-a-Row Scorer", category:"board",
  players:{min:1,max:1,multiplayer:false},
  description:"Fill a 4x4 board alternating with an AI — score points for every 3-in-a-row you form!",
  howToPlay:`3-in-a-Row Scorer uses a 4x4 grid (16 cells). You and the AI alternate placing marks until the board is full. Instead of a single winner, you score points for every 3-in-a-row line you create — horizontal, vertical, or diagonal.

You play as X, the AI plays as O. After every two moves (one each), the 3-in-a-row counts are updated. Since the same marks can contribute to multiple lines, clever placement can score several points at once.

When the board is full, whoever has more 3-in-a-row lines wins 100 points. Equal lines gives 50 points (draw). Losing gives 0.

Strategy: diagonal and central positions tend to contribute to more possible lines. But watch what the AI is building — sometimes blocking is more important than scoring your own lines. Click New Game to replay with a new board arrangement.`,
  settings,
  initialState:(seed:number,s:S)=>initialState(seed,s as TicTacToe3InRowSettings),
  reducer, isTerminal, hint: (state: TicTacToe3InRowState): HintTarget | null => state.phase === "playing" ? { selector: '.ttt-board', pulses: 3 } : null, component:TicTacToe3InRow,
};
