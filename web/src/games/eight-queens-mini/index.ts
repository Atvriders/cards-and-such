import { lazy } from "react";
import type * as React from "react";
import type { GamePlugin } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { EightQueensMiniState, EightQueensMiniAction, EightQueensMiniSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
const EightQueensMiniGame = /* @__PURE__ */ lazy(() => import("./Game.js").then((mod) => ({ default: mod.EightQueensMiniGame as unknown as React.ComponentType<unknown> })));
const settings = { dummy: { kind:"boolean" as const, label:"dummy", default:false } } as const;
type S = SettingsOf<typeof settings>;
export const eightQueensMiniPlugin: GamePlugin<EightQueensMiniState, EightQueensMiniAction, typeof settings> = {
  id:"eight-queens-mini", title:"Eight Queens Mini", category:"board",
  players:{ min:1, max:1, multiplayer:false },
  description:"Place 4 non-attacking queens on a 4x4 board. Solve 4 puzzles.",
  howToPlay:`Eight Queens Mini is a relaxed 4×4 version of the classic n-queens puzzle. Your goal: place exactly four queens on the board so that no two queens share a row, column, or diagonal — they cannot attack each other.

Tap any cell to toggle a queen on or off. When you've placed your four, press Submit. If the placement is valid, you score 25 points and advance to the next puzzle. Solve all 4 puzzles to finish the game with a maximum of 100 points.

The 4×4 puzzle has only two valid solutions (and reflections), so it's a tight pure-logic challenge. The 4-rook trap (one per row & column but ignoring diagonals) is easy; finding the 4-queens placement requires checking diagonals carefully. A common valid solution: column-positions [1,3,0,2] across rows 0-3.

Tap Reset to clear and try again. Eight Queens Mini is short, sharp, and a great introduction to constraint logic puzzles.`,
  settings,
  initialState:(seed:number,s:S)=>initialState(seed,s as EightQueensMiniSettings),
  reducer,isTerminal,component:EightQueensMiniGame,
};
