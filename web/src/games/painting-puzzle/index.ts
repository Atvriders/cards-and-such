import { lazy } from "react";
import type * as React from "react";
import type { GamePlugin } from "../../platform/game-plugin/types.js";
import type { PaintState, PaintAction } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
const PaintingPuzzle = /* @__PURE__ */ lazy(() => import("./Game.js").then((mod) => ({ default: mod.PaintingPuzzle as unknown as React.ComponentType<unknown> })));
export const paintingPuzzlePlugin = {
  id: "painting-puzzle",
  title: "Painting Puzzle",
  category: "board",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Fill a 4x4 grid so every row and column contains exactly one Red, Blue, Green, and Yellow. A colorful Latin square challenge!",
  howToPlay: `Painting Puzzle is a color logic puzzle played on a 4×4 grid. Your goal is to paint every cell so that each row and each column contains exactly one of each of the four colors: Red, Blue, Green, and Yellow.

Some cells are pre-painted and locked — they are your clues and cannot be changed. Use them to deduce where the remaining colors must go.

Click any unlocked cell to cycle through the colors: empty → Red → Blue → Green → Yellow → empty. Keep clicking to advance to the next color, or cycle back to empty if you need to try again.

The puzzle solves automatically the moment every cell is filled and every row and column has exactly one of each color. You earn a higher score if you solve it in fewer total clicks.

Strategy: Start with rows or columns that already have three colors revealed — the fourth position is forced. Look for colors that appear multiple times in the same row or column to identify impossible placements. Work from the most constrained cells outward.

Click New Puzzle anytime to get a fresh layout. Each new puzzle is slightly more complex than the last!`,
  settings: {} as const,
  initialState: (seed: number) => initialState(seed),
  reducer: reducer as (state: PaintState, action: PaintAction) => PaintState,
  isTerminal,
  hint: (s: any) => { const p = (s as any).phase; if (p === "gameover" || p === "done" || p === "ended" || (s as any).gameOver || (s as any).won || (s as any).isWon || (s as any).isComplete || (s as any).complete) return null; return { selector: '[data-testid="hint-target-painting-puzzle-action"]', pulses: 3 }; },
  component: PaintingPuzzle,
} as unknown as GamePlugin;
