import { lazy } from "react";
import type * as React from "react";
import type { GamePlugin } from "../../platform/game-plugin/types.js";
import type { TapaMiniState, TapaMiniAction, TapaMiniSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
const TapaMiniGame = /* @__PURE__ */ lazy(() => import("./Game.js").then((mod) => ({ default: mod.TapaMiniGame as unknown as React.ComponentType<unknown> })));
const settings = { dummy: { kind: "boolean" as const, label: "dummy", default: false } } as const;
export const tapaMiniPlugin: GamePlugin<TapaMiniState, TapaMiniAction, typeof settings> = {
  id: "tapa-mini",
  title: "Tapa Mini",
  category: "board",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Shade cells around clues based on group sizes; shaded cells stay connected.",
  howToPlay: "Tapa is a wall-shading puzzle. White cells contain clues like \"3 1\", indicating shaded-cell group sizes in the surrounding 8 neighbor cells. The clue \"3 1\" means among the up-to-8 neighbors, there are exactly two groups of shaded cells: one with 3 cells, one with 1 cell, separated by a white gap.\n\nClues describe the surrounding shading pattern, not the cell itself. Numbers can appear in any order. Additional rules: all shaded cells must form one connected region; no 2x2 block of shaded cells is allowed; numbered cells stay white.\n\nIn this mini version each puzzle shows a small grid with one clue and partial shading. The prompt asks which neighbor must (or must not) be shaded.\n\nSix puzzles per round, scoring 100 points each plus a 10-point time bonus per remaining second. Wrong picks reveal the right answer.\n\nTapa is satisfying because clue logic is local — each cell's neighborhood is one small constraint, and constraints chain across neighbors. Master the no-2x2 and connectivity rules, and Tapa puzzles fall into place rhythmically.",
  settings,
  initialState: (seed: number) => initialState(seed, { dummy: true } as TapaMiniSettings),
  reducer,
  isTerminal,
  hint: (s: any) => { const p = (s as any).phase; if (p === "done" || p === "gameover" || p === "ended" || p === "finished" || (s as any).gameOver || (s as any).won || (s as any).complete || (s as any).isComplete) return null; return { selector: ".tapaturkish-num", pulses: 3 }; },
  component: TapaMiniGame,
};
