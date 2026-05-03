import { lazy } from "react";
import type * as React from "react";
import type { GamePlugin } from "../../platform/game-plugin/types.js";
import type { SkyscrapersState, SkyscrapersAction, SkyscrapersSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
const Skyscrapers = /* @__PURE__ */ lazy(() => import("./Game.js").then((mod) => ({ default: mod.Skyscrapers as unknown as React.ComponentType<unknown> })));
export const skyscrapersSettings = {
  size: {
    kind: "enum" as const,
    label: "Grid Size",
    options: ["4", "5", "6"] as const,
    default: "4",
  },
} as const;

export const skyscrapersPlugin: GamePlugin<SkyscrapersState, SkyscrapersAction, typeof skyscrapersSettings> = {
  id: "skyscrapers",
  title: "Skyscrapers",
  category: "board",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Fill the N×N grid with building heights 1–N so that edge clues match the count of visible buildings.",
  howToPlay: `Skyscrapers is a Latin-square puzzle with a city-skyline twist. Fill an N×N grid so that each row and each column contains every height from 1 to N exactly once — just like Sudoku rows and columns.

Around the edges of the grid are clue numbers. Each clue tells you how many buildings are visible when you look along that row or column from that side. A tall building hides all shorter buildings behind it. For example, the sequence 3-1-2 seen from the left has the 3 visible first, then 1 is hidden (3 is taller), then 2 is hidden — so you'd see only 1 building. But 1-2-3 from the left reveals all 3 buildings in turn.

Click a cell to select it (blue highlight), then press a digit key or click a digit button to enter a height. Cells with duplicate values in their row or column, or completed rows/columns that don't match their clues, are highlighted in red. Press Backspace or the Clear button to erase a cell.

Strategy tip: a clue of 1 means the tallest building (height N) must be first. A clue of N means the buildings must be in increasing order from that side. Use these anchor points to constrain the other cells.`,
  settings: skyscrapersSettings,
  initialState: (seed: number, settings: SkyscrapersSettings) => initialState(seed, settings),
  reducer,
  isTerminal,
  hint: (s: any) => { const p = (s as any).phase; if (p === "gameover" || p === "done" || p === "ended" || (s as any).gameOver || (s as any).won || (s as any).isWon || (s as any).isComplete || (s as any).complete) return null; return { selector: '[data-testid="hint-target-skyscrapers-action"]', pulses: 3 }; },
  component: Skyscrapers,
};
