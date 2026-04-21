import type { GamePlugin } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { FifteenPuzzleState, FifteenPuzzleAction } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { Fifteen } from "./Fifteen.js";

export const fifteenPuzzleSettings = {
  size: {
    kind: "enum" as const,
    label: "Size",
    options: ["3", "4", "5"] as const,
    default: "4" as const,
  },
  shuffleMoves: {
    kind: "enum" as const,
    label: "Shuffle",
    options: ["20", "50", "100", "200"] as const,
    default: "50" as const,
  },
} as const;

type FifteenPuzzleSettingsType = SettingsOf<typeof fifteenPuzzleSettings>;

export const fifteenPuzzlePlugin: GamePlugin<FifteenPuzzleState, FifteenPuzzleAction, typeof fifteenPuzzleSettings> = {
  id: "fifteen-puzzle",
  title: "15 Puzzle",
  category: "board",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Slide numbered tiles to arrange them in order.",
  settings: fifteenPuzzleSettings,
  initialState: (seed: number, settings: FifteenPuzzleSettingsType) => initialState(seed, settings),
  reducer,
  isTerminal,
  component: Fifteen,
};
