import type { GamePlugin } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { LightsOutState, LightsOutAction } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { LightsOut } from "./LightsOut.js";

export const lightsOutSettings = {
  size: {
    kind: "enum" as const,
    label: "Grid",
    options: ["4", "5", "6"] as const,
    default: "5" as const,
  },
  difficulty: {
    kind: "enum" as const,
    label: "Difficulty",
    options: ["easy", "medium", "hard"] as const,
    default: "medium" as const,
  },
} as const;

type LightsOutSettingsType = SettingsOf<typeof lightsOutSettings>;

export const lightsOutPlugin: GamePlugin<LightsOutState, LightsOutAction, typeof lightsOutSettings> = {
  id: "lights-out",
  title: "Lights Out",
  category: "board",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Turn off all the lights. Each press toggles a cross pattern.",
  howToPlay: `Turn off every light on the grid to win. Each click toggles a cross pattern of cells.

Click any lit or unlit cell to toggle it and its four orthogonal neighbors (up, down, left, right). Cells on the edges or corners have fewer neighbors. The goal is to find a sequence of clicks that turns every light off. There is no explicit turn limit, but your score depends on how few moves you use.

Score on winning is max(100, 1000 − moves × 10). Grid size can be set to 4×4, 5×5, or 6×6. Difficulty (easy, medium, hard) controls how many random presses scramble the board at the start — hard produces a more deeply mixed puzzle.

Tips: Lights Out has a mathematical solution — every valid puzzle can be solved. A useful technique called "chase the lights" works row by row: starting from the top, click cells in the second row to turn off any lights in the first row, then repeat downward. Fix the remaining bottom row using the pattern you created. On smaller grids, trial and error combined with this technique usually finds the solution quickly.`,
  settings: lightsOutSettings,
  initialState: (seed: number, settings: LightsOutSettingsType) => initialState(seed, settings),
  reducer,
  isTerminal,
  component: LightsOut,
};
