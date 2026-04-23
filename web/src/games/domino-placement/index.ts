import type { GamePlugin } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { DominoState, DominoAction, DominoSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { DominoPlacement } from "./DominoPlacement.js";

export const dominoSettings = {
  difficulty: {
    kind: "enum" as const,
    label: "Difficulty",
    options: ["easy", "medium", "hard"] as const,
    default: "easy",
  },
} as const;

type DominoSettingsType = SettingsOf<typeof dominoSettings>;

export const dominoPlacementPlugin: GamePlugin<DominoState, DominoAction, typeof dominoSettings> = {
  id: "domino-placement",
  title: "Domino Placement",
  category: "board",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Partition the number grid into dominoes — place all 28 pieces (0-0 through 6-6) exactly once.",
  howToPlay: `Domino Placement challenges you to find where all 28 dominoes of a standard set are hidden within a rectangular grid of numbers. The grid is pre-filled with digits from 0 to 6, and your job is to draw the boundaries that divide the grid into pairs of adjacent cells — each pair forming one domino.

A standard domino set contains every combination from 0-0 to 6-6, including doubles (0-0, 1-1, ... 6-6) and all mixed pairs (0-1, 0-2, ... 5-6), totaling 28 pieces. Each domino must be used exactly once.

Click the thin dividers between horizontally or vertically adjacent cells to toggle a wall. A blue wall means you've separated those two cells into different dominoes. When every cell belongs to exactly one pair, and those pairs collectively use all 28 domino values without repetition, you win.

Strategy: identify cells whose two neighbors produce a unique domino combination that hasn't appeared elsewhere. Mark those boundaries first. Use a checklist of remaining dominoes to eliminate impossible placements. Doubles (like 3-3) appear only where both cells show the same digit — narrow those down early.`,
  settings: dominoSettings,
  initialState: (seed: number, settings: DominoSettingsType) => initialState(seed, settings),
  reducer,
  isTerminal,
  component: DominoPlacement,
};
