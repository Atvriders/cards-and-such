import { lazy } from "react";
import type * as React from "react";
import type { GamePlugin } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { NumlinksState, NumlinksAction, NumlinksSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
const NumlinksGame = /* @__PURE__ */ lazy(() => import("./Game.js").then((mod) => ({ default: mod.NumlinksGame as unknown as React.ComponentType<unknown> })));
const settings = { dummy: { kind: "boolean" as const, label: "dummy", default: false } } as const;
type S = SettingsOf<typeof settings>;
export const numlinksPlugin: GamePlugin<NumlinksState, NumlinksAction, typeof settings> = {
  id: "numlinks", title: "Numlinks", category: "board",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Click numbers 1 through 16 in order on a 4x4 grid. 8 puzzles.",
  howToPlay: `Numlinks is a fast-paced sequencing puzzle on a 4x4 grid. Each puzzle scatters the numbers 1 through 16 randomly across sixteen cells. Your goal is to click them in strictly increasing order — first the 1, then the 2, then the 3, all the way up to 16.

Each correct click scores you 10 points. Completing all 16 cells in a puzzle earns a 50-point bonus. A wrong click — clicking any number out of order — ends the current puzzle immediately, but you keep all the points you have already earned and can move to the next.

There are 8 puzzles per game, so the maximum theoretical score is 8 puzzles times (16 numbers x 10 + 50 bonus), or 1680 points.

Strategy: scan the grid for the next number quickly before you click. Cells you have already cleared turn green, helping you keep visual track of your progress. Speed matters less than accuracy — one wrong click ends the puzzle.

Aim for accuracy, complete every puzzle, and chase that 1680 score!`,
  settings,
  initialState: (seed: number, s: S) => initialState(seed, s as NumlinksSettings),
  reducer, isTerminal, component: NumlinksGame,
};
