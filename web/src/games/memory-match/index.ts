import type { GamePlugin } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { MemoryMatchState, MemoryMatchAction } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { MemoryMatch } from "./MemoryMatch.js";

export const memoryMatchSettings = {
  size: {
    kind: "enum" as const,
    label: "Pairs",
    options: ["6", "8", "12", "18"] as const,
    default: "8" as const,
  },
} as const;

type MemoryMatchSettingsType = SettingsOf<typeof memoryMatchSettings>;

export const memoryMatchPlugin: GamePlugin<MemoryMatchState, MemoryMatchAction, typeof memoryMatchSettings> = {
  id: "memory-match",
  title: "Memory Match",
  category: "board",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Flip two cards at a time, find all matching pairs.",
  settings: memoryMatchSettings,
  initialState: (seed: number, settings: MemoryMatchSettingsType) => initialState(seed, settings),
  reducer,
  isTerminal,
  component: MemoryMatch,
};
