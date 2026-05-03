import type { TileMatchRushState, TileMatchRushAction } from "./state.js";
import type { HintTarget } from "../../platform/game-plugin/types.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { TileMatchRush } from "./TileMatchRush.js";

export const tileMatchRushSettings = {
  duration: {
    kind: "enum" as const,
    label: "Time Limit",
    options: ["60", "120", "180"] as const,
    default: "120" as const,
  },
  gridSize: {
    kind: "enum" as const,
    label: "Grid Size",
    options: ["small", "medium", "large"] as const,
    default: "medium" as const,
  },
} as const;

export const tileMatchRushPlugin = {
  id: "tile-match-rush",
  title: "Tile Match Rush",
  category: "board",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Race against the clock to match Mahjong tile pairs connected by at most 2-turn paths. Build combos!",
  howToPlay: `Tile Match Rush is a speed-matching game. A flat grid of face-up Mahjong tiles is displayed and a timer counts down. Match pairs before time runs out!

Select a tile by clicking it (highlighted blue), then click another tile showing the same face. They are removed only if they can be connected by a path of at most 2 turns that passes only through empty cells (including the empty border around the board). If no path exists, the second click changes your selection instead.

Score 100 points per matched pair — but build a combo multiplier by matching another pair within 2 seconds of your previous match. A x2 combo earns 200, x3 earns 300, and so on. Missing the 2-second window resets your combo to x1.

The game ends when the timer expires OR you clear the entire board. Settings control the time limit (60, 120, or 180 seconds) and the grid size (Small 8×6, Medium 10×8, Large 12×10).

Tips: Scan for easy adjacent matches first to build your combo, then tackle isolated tiles. Watch the timer — chase combos when you have time, play safe when running low. Clearing the whole board earns your accumulated score regardless of time remaining.`,
  settings: tileMatchRushSettings,
  initialState,
  reducer,
  isTerminal,
  hint: (): HintTarget | null => (typeof document !== "undefined" && document.querySelector(".tmr-grid")) ? { selector: ".tmr-grid", pulses: 3 } : null,
  component: TileMatchRush,
};
