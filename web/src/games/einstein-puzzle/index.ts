import { lazy } from "react";
import type * as React from "react";
import type { GamePlugin } from "../../platform/game-plugin/types.js";
import type { EinsteinState, EinsteinAction, EinsteinSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
const EinsteinPuzzleGame = /* @__PURE__ */ lazy(() => import("./Game.js").then((mod) => ({ default: mod.EinsteinPuzzleGame as unknown as React.ComponentType<unknown> })));
const settings = {} as const;

export const einsteinPuzzlePlugin: GamePlugin<EinsteinState, EinsteinAction, typeof settings> = {
  id: "einstein-puzzle",
  title: "Einstein Puzzle",
  category: "board",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Classic Zebra-style deduction puzzle — use clues to place five values into five positions across five categories.",
  howToPlay: `Einstein Puzzle (also called the Zebra Puzzle) is one of the most famous logic deduction challenges. You are given five positions and five categories, each with five possible values. Each position holds exactly one value from every category, and no two positions share a value within any category.

Your goal is to use the provided clues to figure out which value belongs in each position for every category. The grid shows one section per category. Rows represent values; columns represent positions. Click a cell once to mark it ✓ (yes — this value belongs here), again for ✗ (no — it does not), and a third time to clear it back to neutral.

When you mark a cell ✓, remember to mark all other cells in that row and column (within that category section) as ✗, since each position has exactly one value.

Start with direct-assignment clues like "Alice lives in position 1." These anchor the grid and cascade into many other deductions. Relational clues like "immediately to the right" pin relative positions. Work systematically and cross-reference clues until every cell is determined.

The puzzle is solved when every cell is correctly marked. Einstein reportedly said only 2% of people could solve it unaided — use logic, not guessing!`,
  settings,
  initialState: (seed: number, s: EinsteinSettings) => initialState(seed, s),
  reducer,
  isTerminal,
  hint: (s: any) => { const p = (s as any).phase; if (p === "done" || p === "gameover" || p === "ended" || p === "finished" || (s as any).gameOver || (s as any).won || (s as any).complete || (s as any).isComplete) return null; return { selector: ".einstein-reset-btn", pulses: 3 }; },
  component: EinsteinPuzzleGame,
};
