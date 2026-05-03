import { lazy } from "react";
import type * as React from "react";
import type { GamePlugin } from "../../platform/game-plugin/types.js";
import type { BinairoMiniState, BinairoMiniAction, BinairoMiniSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
const BinairoMiniGame = /* @__PURE__ */ lazy(() => import("./Game.js").then((mod) => ({ default: mod.BinairoMiniGame as unknown as React.ComponentType<unknown> })));
const settings = { dummy: { kind: "boolean" as const, label: "dummy", default: false } } as const;
export const binairoMiniPlugin: GamePlugin<BinairoMiniState, BinairoMiniAction, typeof settings> = {
  id: "binairo-mini",
  title: "Binairo Mini",
  category: "board",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Fill grid with 0s and 1s. Each row/column has equal counts. No three same digits consecutively in any row/column.",
  howToPlay: "Binairo Mini fills a grid with only 0s and 1s. Each row and each column must contain equal counts of 0 and 1 — for a 4-wide row that's 2 of each, for a 6-wide row that's 3 of each. Additionally, no row or column may contain three of the same digit in a row.\n\nThe \"no three in a row\" rule makes Binairo feel like Sudoku's binary cousin. Combined with the equal-count rule, it produces deep deductions despite using only two symbols.\n\nEach puzzle shows a small grid (4x4 or 6x6) with some cells pre-filled. A target cell is highlighted with two visible candidates (0 and 1) padded out with two distractors. Apply the rules to find the unique value.\n\nSix puzzles per round; 100 points per correct answer plus a 10-point-per-second time bonus. Wrong picks reveal the correct digit. Binairo is gentle but strategic — patterns like \"00? must be 1\" emerge constantly.",
  settings,
  initialState: (seed: number) => initialState(seed, { dummy: true } as BinairoMiniSettings),
  reducer,
  isTerminal,
  hint: (s: any) => { const p = (s as any).phase; if (p === "done" || p === "gameover" || p === "ended" || p === "finished" || (s as any).gameOver || (s as any).won || (s as any).complete || (s as any).isComplete) return null; return { selector: ".binairobinary-num", pulses: 3 }; },
  component: BinairoMiniGame,
};
