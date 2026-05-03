import { lazy } from "react";
import type * as React from "react";
import type { GamePlugin } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { VisualMemoryGridState, VisualMemoryGridAction } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
const VisualMemoryGrid = /* @__PURE__ */ lazy(() => import("./VisualMemoryGrid.js").then((mod) => ({ default: mod.VisualMemoryGrid as unknown as React.ComponentType<unknown> })));
export const visualMemoryGridSettings = {
  gridSize: {
    kind: "enum" as const,
    label: "Grid Size",
    options: ["3", "4", "5"] as const,
    default: "4" as const,
  },
  startFilled: {
    kind: "enum" as const,
    label: "Starting Cells",
    options: ["3", "4", "5"] as const,
    default: "3" as const,
  },
} as const;

type VisualMemoryGridSettingsType = SettingsOf<typeof visualMemoryGridSettings>;

export const visualMemoryGridPlugin: GamePlugin<VisualMemoryGridState, VisualMemoryGridAction, typeof visualMemoryGridSettings> = {
  id: "visual-memory-grid",
  title: "Visual Memory Grid",
  category: "board",
  players: { min: 1, max: 1, multiplayer: false },
  description: "A pattern of lit cells flashes briefly. Recreate it from memory by clicking the correct cells.",
  howToPlay: `A grid of squares appears. Some squares are highlighted. Study the pattern carefully — then it disappears and you must click the squares that were lit to recreate the pattern from memory.

Click squares to select them (they turn blue), click again to deselect. When you are confident in your selection, press Submit. If every selected cell matches the original pattern exactly, you advance to the next round with one more lit cell. A mistake costs a life.

You have three lives. When all three are gone, the game ends and your score is displayed. Score equals the total number of cells correctly recalled across all rounds.

Grid size affects how many cells are in play — a 3x3 grid has 9 cells, 4x4 has 16, and 5x5 has 25. Larger grids give more space and more combinations but also more potential for confusion. Starting cells controls how many cells are lit in round one.

Tips: Group the lit cells into shapes or patterns you recognize — a diagonal, an L-shape, a cross. Assigning a narrative ("top-left corner plus two on the right") can help too. Take a moment to look away and reconstruct the image in your mind before clicking. The pattern gets denser each round, so efficient mental encoding becomes crucial.`,
  settings: visualMemoryGridSettings,
  initialState: (seed: number, settings: VisualMemoryGridSettingsType) => initialState(seed, settings),
  reducer,
  isTerminal,
  hint: (s: any) => { const p = (s as any).phase; if (p === "done" || p === "gameover" || p === "ended" || p === "finished" || (s as any).gameOver || (s as any).won || (s as any).complete || (s as any).isComplete) return null; return { selector: ".vmg-next-btn", pulses: 3 }; },
  component: VisualMemoryGrid,
};
