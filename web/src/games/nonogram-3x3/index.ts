import { lazy } from "react";
import type * as React from "react";
import type { GamePlugin, SettingsOf } from "../../platform/game-plugin/types.js";
import type { Nonogram3x3State, Nonogram3x3Action, Nonogram3x3Settings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
const Nonogram3x3Game = /* @__PURE__ */ lazy(() => import("./Game.js").then((mod) => ({ default: mod.Nonogram3x3Game as unknown as React.ComponentType<unknown> })));
const settings = { dummy: { kind:"boolean" as const, label:"dummy", default:false } } as const;
type S = SettingsOf<typeof settings>;
export const nonogram3x3Plugin: GamePlugin<Nonogram3x3State, Nonogram3x3Action, typeof settings> = {
  id:"nonogram-3x3", title:"Nonogram 3x3", category:"board",
  players:{ min:1, max:1, multiplayer:false },
  description:"Tiny picross: shade the 3x3 grid to match the row and column clues.",
  howToPlay:`Nonogram 3x3 (also called Picross) is a logic puzzle in miniature form. Around the 3x3 grid you'll see numeric clues — each row and column lists the length of every shaded run within that line, in order. A clue of "2" means two consecutive shaded cells; "1,1" means two singletons separated by at least one blank; "0" means an empty line.

Click a cell to toggle it shaded or blank. Then press Check — if your shading exactly matches the hidden picture, the puzzle is solved.

Strategy: start with the rows and columns whose clues fully constrain them. A clue of "3" in a 3-wide line shades everything; a clue of "0" leaves it empty. Cross-reference the rows and columns to deduce the remaining cells.

Your score is 400 minus 5 per move (50 floor), so be deliberate — random clicking burns points fast. Press Play Again for a fresh picture once you finish.`,
  settings,
  initialState:(seed:number,s:S)=>initialState(seed,s as Nonogram3x3Settings),
  reducer, isTerminal, component: Nonogram3x3Game,
};
