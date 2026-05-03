import { lazy } from "react";
import type * as React from "react";
import type { GamePlugin, SettingsOf } from "../../platform/game-plugin/types.js";
import type { MagicSquare3State, MagicSquare3Action, MagicSquare3Settings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
const MagicSquare3Game = /* @__PURE__ */ lazy(() => import("./Game.js").then((mod) => ({ default: mod.MagicSquare3Game as unknown as React.ComponentType<unknown> })));
const settings = { dummy: { kind:"boolean" as const, label:"dummy", default:false } } as const;
type S = SettingsOf<typeof settings>;
export const magicSquare3Plugin: GamePlugin<MagicSquare3State, MagicSquare3Action, typeof settings> = {
  id:"magic-square-3", title:"Magic Square 3", category:"board",
  players:{ min:1, max:1, multiplayer:false },
  description:"Place 1-9 in a 3x3 grid so every row, column, and diagonal sums to 15.",
  howToPlay:`Magic Square 3 is the oldest known mathematical puzzle. Your task: place the digits 1 through 9 into a 3x3 grid so that every row, every column, and both diagonals sum to exactly 15.

There is only one such arrangement up to rotation and reflection — the famous Lo Shu Square attributed to ancient China. The center cell must hold 5; the corners must hold even numbers (2, 4, 6, 8); the edge midpoints must hold odd numbers (1, 3, 7, 9).

Click a number from the pool below the grid to select it, then click any empty cell to place it. Click a placed number to remove it back to the pool. Once every row, column, and diagonal sums to 15, the puzzle is solved.

Score: 400 minus 10 per move, with a 50-point floor. The minimum possible move count is 9 — one for each number — so a perfect solve scores 310.

Press Play Again to start over and lock in the technique.`,
  settings,
  initialState:(seed:number,s:S)=>initialState(seed,s as MagicSquare3Settings),
  reducer, isTerminal, component: MagicSquare3Game,
};
