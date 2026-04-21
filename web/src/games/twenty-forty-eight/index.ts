import type { GamePlugin } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { TwoFortyEightState, TwoFortyEightAction } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { TwentyFortyEight } from "./TwentyFortyEight.js";

export const twoFortyEightSettings = {
  boardSize: {
    kind: "enum" as const,
    label: "Board size",
    options: ["3", "4", "5"] as const,
    default: "4" as const,
  },
  target: {
    kind: "enum" as const,
    label: "Target",
    options: ["1024", "2048", "4096"] as const,
    default: "2048" as const,
  },
} as const;

type TwoFortyEightSettingsType = SettingsOf<typeof twoFortyEightSettings>;

export const twoFortyEightPlugin: GamePlugin<
  TwoFortyEightState,
  TwoFortyEightAction,
  typeof twoFortyEightSettings
> = {
  id: "2048",
  title: "2048",
  category: "board",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Slide tiles to merge. Reach 2048 (or higher).",
  howToPlay: `Slide all tiles on the board in one direction to merge matching numbers and reach the target tile value.

Use the arrow keys or WASD to slide every tile on the board in that direction. When two tiles with the same number collide they merge into one tile with their combined value, and that value is added to your score. After each slide a new tile (2 or 4) appears in a random empty cell. The game is won when a tile reaches the target value (1024, 2048, or 4096). After winning, choose "Keep going" to continue playing for a higher score. The game ends when no moves remain.

Score is the cumulative sum of all merge values throughout the game. Choose a board size of 3×3, 4×4, or 5×5 in settings — smaller boards are harder because space runs out faster.

Tips: Keep your highest tile in a corner and build a descending chain of values away from it. Avoid sliding in the direction that breaks your chain. On a 4×4 board, mastering the corner strategy reliably reaches 2048.`,
  settings: twoFortyEightSettings,
  initialState: (seed: number, settings: TwoFortyEightSettingsType) =>
    initialState(seed, settings),
  reducer,
  isTerminal,
  component: TwentyFortyEight,
};
