import type { GamePlugin } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { LightsOut3DState, LightsOut3DAction } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { LightsOut3D } from "./LightsOut3D.js";

export const lightsOut3DSettings = {
  difficulty: {
    kind: "enum" as const,
    label: "Difficulty",
    options: ["easy", "medium", "hard"] as const,
    default: "easy" as const,
  },
} as const;

type LightsOut3DSettingsType = SettingsOf<typeof lightsOut3DSettings>;

export const lightsOut3DPlugin: GamePlugin<LightsOut3DState, LightsOut3DAction, typeof lightsOut3DSettings> = {
  id: "lights-out-3d",
  title: "Lights Out 3D",
  category: "board",
  players: { min: 1, max: 1, multiplayer: false },
  description: "The classic Lights Out puzzle extended to a 3×3×3 cube. Toggle adjacent cells across all three layers to turn every light off.",
  howToPlay: `Lights Out 3D extends the classic Lights Out puzzle into three dimensions. You have a 3×3×3 cube of 27 cells, some of which start turned on (shown in amber with a bulb icon). Your goal is to turn every single cell off.

Clicking any cell toggles that cell plus up to six face-adjacent neighbors — the cell directly above, below, left, right, in front, and behind it within the cube. Cells on edges and corners have fewer neighbors. The key insight: pressing a cell changes its state and the states of all its orthogonal neighbors simultaneously.

The cube is shown as three separate 3×3 grids representing the bottom, middle, and top layers. A cell's neighbors include cells in the same layer (left, right, up, down) as well as the corresponding cell in the layer directly above or below.

Difficulty determines how many random presses were used to generate the starting puzzle: Easy uses 3 presses (few lights on), Medium uses 6 presses (moderate), and Hard uses 10 presses (many lights, complex interactions). All puzzles are guaranteed solvable.

Scoring: 300 points minus 5 per move, with a floor of 10. The fewer moves you use to reach all-off, the higher your score. Experienced players look for symmetric patterns and work layer by layer.`,
  settings: lightsOut3DSettings,
  initialState: (seed: number, settings: LightsOut3DSettingsType) => initialState(seed, settings),
  reducer,
  isTerminal,
  component: LightsOut3D,
};
