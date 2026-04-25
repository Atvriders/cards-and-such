import type { GamePlugin } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { FrozenRiverState, FrozenRiverAction } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { FrozenRiver } from "./FrozenRiver.js";

export const frozenRiverSettings = {
  width: {
    kind: "enum" as const,
    label: "River Width",
    options: ["5", "7", "9"] as const,
    default: "5" as const,
  },
} as const;

type FrozenRiverSettingsType = SettingsOf<typeof frozenRiverSettings>;

export const frozenRiverPlugin: GamePlugin<FrozenRiverState, FrozenRiverAction, typeof frozenRiverSettings> = {
  id: "frozen-river",
  title: "Frozen River",
  category: "board",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Cross a frozen river grid without falling through thin ice or holes.",
  howToPlay: `Frozen River is a careful pathfinding board game set on a treacherous icy crossing. You must guide your character from the starting tile (🏠) in the top-left corner to the safe ground (🏁) at the bottom-right, without plunging into the freezing water below.

The river grid contains several tile types. Plain ice tiles are safe to walk on. Cracked ice tiles (❄️) can be crossed but are unstable — stepping on one adds a one-step penalty to your move count. Holes (💧) in the ice are fatal; step on one and you fall through, ending the game with zero score. Rocks (🪨) are impassable solid obstacles.

Use the arrow buttons to move up, down, left, or right one tile at a time. You cannot move off the edge of the grid.

A safe path always exists through the grid, but finding the optimal route that avoids cracks and holes requires careful observation of the grid before moving.

Scoring: falling through a hole scores zero. Reaching the far bank safely earns up to 1000 points, minus a penalty for each step taken (including crack penalties). Shorter routes earn more. Grid sizes of 5, 7, and 9 tiles wide offer increasing challenge.

Tips: scan each row for holes before stepping forward. Cracked tiles are worth crossing if they save several steps by avoiding a detour around a rock or hole cluster. Always have an escape route in mind before committing to a direction.`,
  settings: frozenRiverSettings,
  initialState: (seed: number, settings: FrozenRiverSettingsType) => initialState(seed, settings),
  reducer,
  isTerminal,
  component: FrozenRiver,
};
