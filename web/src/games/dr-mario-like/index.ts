import type { GamePlugin } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { DrMarioState, DrMarioAction } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { DrMario } from "./DrMario.js";

export const drMarioSettings = {
  difficulty: {
    kind: "enum" as const,
    label: "Difficulty",
    options: ["low", "medium", "high"] as const,
    default: "medium" as const,
  },
} as const;

type DrMarioSettingsType = SettingsOf<typeof drMarioSettings>;

export const drMarioPlugin: GamePlugin<DrMarioState, DrMarioAction, typeof drMarioSettings> = {
  id: "dr-mario-like",
  title: "Capsule Doctor",
  category: "board",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Drop two-colored capsules to match and clear virus blobs. Eliminate all viruses to win.",
  howToPlay: `The bottle is filled with colored virus blobs in the lower half. Your job is to drop two-cell capsules from the top to match and eliminate them. A capsule is two colored halves joined together — it starts horizontal at the top.

Use Left and Right arrow keys (or A / D) to move the capsule sideways. Press Up or W to rotate it 90 degrees. Press Down or S for a slow drop one row at a time. Press Space to instantly drop it to the lowest available row.

Matches require four or more same-colored cells in a straight horizontal or vertical line. When a match forms, those cells (capsule halves and viruses alike) disappear. Remaining pieces then fall under gravity, which can trigger additional chain reactions. Each cleared cell scores 25 points; bonus 1000 points are awarded for clearing all viruses.

The goal is to eliminate every virus on the board. The game ends immediately if a new capsule cannot be placed because the grid is too full.

Difficulty controls the number of viruses placed at the start: Low (15), Medium (25), High (40). With more viruses you need to plan each capsule placement carefully to set up chain clears. Match the color of each capsule half to the virus colors around it.`,
  settings: drMarioSettings,
  initialState: (seed: number, settings: DrMarioSettingsType) => initialState(seed, settings),
  reducer,
  isTerminal,
  component: DrMario,
};
