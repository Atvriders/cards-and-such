import type { GamePlugin } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { ShakaState, ShakaAction, ShakaSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { Shakashaka } from "./Shakashaka.js";

export const shakaSettings = {
  difficulty: {
    kind: "enum" as const,
    label: "Difficulty",
    options: ["easy", "medium"] as const,
    default: "easy",
  },
} as const;

type ShakaSettingsType = SettingsOf<typeof shakaSettings>;

export const shakashakaPlugin: GamePlugin<ShakaState, ShakaAction, typeof shakaSettings> = {
  id: "shakashaka",
  title: "Shakashaka",
  category: "board",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Place right triangles in white cells so every white region forms a rectangle.",
  howToPlay: `Shakashaka is a Japanese logic puzzle invented by Nikoli. The grid contains black cells (some with number clues 0–4) and white cells. Your task is to place right triangles in some white cells so that every remaining white region — the parts of the grid not covered by black cells or triangles — forms a rectangle. The rectangles may be axis-aligned or rotated 45 degrees (forming diamond shapes).

Each triangle is a right-triangle occupying half of a cell, pointing in one of four directions: top-left, top-right, bottom-left, or bottom-right. Numbered black cells constrain how many of their four orthogonal neighbors contain a triangle. A black cell with a 0 means none of its neighbors holds a triangle; a 4 means all four neighbors do.

Select a triangle orientation from the toolbar, then click any white cell to place it. Click a triangle cell again to remove it. Cells matching the solution turn light green.

Strategy: start with 0-clued black cells (clear all their neighbors) and 4-clued cells (force triangles in all neighbors). Then analyze which triangle orientations are forced by the need to form rectangles in the white regions — rectangles cannot have jagged or L-shaped boundaries. Work inward from constrained edges.`,
  settings: shakaSettings,
  initialState: (seed: number, settings: ShakaSettingsType) => initialState(seed, settings),
  reducer,
  isTerminal,
  component: Shakashaka,
};
