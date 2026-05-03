import { lazy } from "react";
import type * as React from "react";
import type { GamePlugin, HintTarget } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { ColorFlowState, ColorFlowAction } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
const ColorFlow = /* @__PURE__ */ lazy(() => import("./Game.js").then((mod) => ({ default: mod.ColorFlow as unknown as React.ComponentType<unknown> })));
export const colorFlowSettings = {
  difficulty: {
    kind: "enum" as const,
    label: "Difficulty",
    options: ["easy", "medium", "hard"] as const,
    default: "easy" as const,
  },
} as const;

type ColorFlowSettingsType = SettingsOf<typeof colorFlowSettings>;

export const colorFlowPlugin: GamePlugin<ColorFlowState, ColorFlowAction, typeof colorFlowSettings> = {
  id: "flowfree-clone",
  title: "Color Flow",
  category: "board",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Draw color flows to connect matching dots and fill every cell.",
  howToPlay: `Connect each pair of matching colored dots with a continuous path. Every single cell on the board must be filled for the puzzle to be solved.

Click and drag from any colored dot to start drawing a flow path. Move orthogonally to other cells. Reach the matching dot of the same color to complete that connection. You must complete all connections AND cover every empty cell to win.

Dragging back over your own path erases it. Starting a new path from a dot clears that color's previous path entirely. Paths cannot cross each other.

Scoring: max(100, 1000 − moves × 5). Easy puzzles use a 5×5 grid with 4 color pairs. Medium uses 6×6 with 5 pairs. Hard uses 7×7 with 5 pairs.

Strategy: Look for dots that are in corners or near board edges — their paths have limited routing options, so handle them first. Longer paths have more flexibility and can wind through the remaining space. Try to avoid boxing yourself in. A good approach is to identify which color pairs "frame" the board and route them first, then fill interior paths.`,
  settings: colorFlowSettings,
  initialState: (seed: number, settings: ColorFlowSettingsType) => initialState(seed, settings),
  reducer,
  isTerminal,
  hint: (): HintTarget | null => (typeof document !== "undefined" && document.querySelector(".color-flow-grid")) ? { selector: ".color-flow-grid", pulses: 3 } : null,
  component: ColorFlow,
};
