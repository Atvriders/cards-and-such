import type { GamePlugin } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { AquariumState, AquariumAction, AquariumSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { Aquarium } from "./Aquarium.js";

export const aquariumSettings = {
  difficulty: {
    kind: "enum" as const,
    label: "Difficulty",
    options: ["easy", "hard"] as const,
    default: "easy",
  },
} as const;

type AquariumSettingsType = SettingsOf<typeof aquariumSettings>;

export const aquariumPlugin: GamePlugin<AquariumState, AquariumAction, typeof aquariumSettings> = {
  id: "aquarium",
  title: "Aquarium",
  category: "board",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Fill aquarium regions with water from the bottom; match row and column water counts.",
  howToPlay: `Aquarium is a logic puzzle where the grid is divided into colored regions called aquariums. Numbers on the left of each row and the top of each column tell you how many cells in that row or column must be filled with water.

The key rule is water physics: within any aquarium, water fills from the bottom up. If you decide to fill any cell in a row of an aquarium, then every cell in that same aquarium that is at or below that row level must also be filled. You cannot fill a cell in row 3 without also filling its aquarium neighbors in rows 4, 5, etc.

Click a cell to cycle through: empty → water (blue) → × (a "not water" marker) → empty. The × is just a helper reminder and does not count as filled. Row and column clue numbers turn green when the count matches.

Strategy: start by identifying columns where the clue number forces a specific water level. Then use the aquarium rules to propagate — if one cell must be filled, determine which other cells in the same aquarium must also be filled. Look for aquariums that span many rows, as they heavily constrain the fill level.`,
  settings: aquariumSettings,
  initialState: (seed: number, settings: AquariumSettingsType) => initialState(seed, settings),
  reducer,
  isTerminal,
  component: Aquarium,
};
