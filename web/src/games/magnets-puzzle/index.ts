import { lazy } from "react";
import type * as React from "react";
import type { GamePlugin } from "../../platform/game-plugin/types.js";
import type { MagnetsPuzzleState, MagnetsPuzzleAction, MagnetsPuzzleSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
const MagnetsPuzzleGame = /* @__PURE__ */ lazy(() => import("./Game.js").then((mod) => ({ default: mod.MagnetsPuzzleGame as unknown as React.ComponentType<unknown> })));
const settings = { dummy: { kind: "boolean" as const, label: "dummy", default: false } } as const;
export const magnetsPuzzlePlugin: GamePlugin<MagnetsPuzzleState, MagnetsPuzzleAction, typeof settings> = {
  id: "magnets-puzzle",
  title: "Magnets",
  category: "board",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Place + and - on domino pieces. Adjacent cells cannot share the same pole. Row/column counts of + and - must match clues.",
  howToPlay: "Magnets fills a grid covered by 1x2 dominoes with magnetic poles. Each domino is either neutral (both halves blank) or magnetic (one half +, one half -). Two cells touching orthogonally cannot share the same pole — like poles repel. Outside each row and column there's a count of + cells and a count of - cells; your placement must match those tallies exactly.\n\nThe puzzle balances three constraints: domino-by-domino sign rules, neighbor-pole repulsion, and row/column count totals. The interplay produces elegant deductions — a row that needs three + and only three valid cells locks immediately.\n\nEach puzzle shows a small grid with dominoes outlined and counts on the borders. A target cell is highlighted with four choices: +, -, blank (neutral), or \"any\". Apply the rules to pick the unique value.\n\nSix puzzles per round; 100 points per correct answer plus a time bonus. Wrong answers reveal the correct symbol. Magnets is one of the most underrated logic puzzles — clean rules, deep deductions.",
  settings,
  initialState: (seed: number) => initialState(seed, { dummy: true } as MagnetsPuzzleSettings),
  reducer,
  isTerminal,
  hint: (s: any) => { const p = (s as any).phase; if (p === "done" || p === "gameover" || p === "ended" || p === "finished" || (s as any).gameOver || (s as any).won || (s as any).complete || (s as any).isComplete) return null; return { selector: ".magnetspoles-num", pulses: 3 }; },
  component: MagnetsPuzzleGame,
};
