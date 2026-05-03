import { lazy } from "react";
import type * as React from "react";
import type { GamePlugin, HintTarget } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { GalaxiesState, GalaxiesAction } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
const Galaxies = /* @__PURE__ */ lazy(() => import("./Galaxies.js").then((mod) => ({ default: mod.Galaxies as unknown as React.ComponentType<unknown> })));
const galaxiesSettings = {
  difficulty: {
    kind: "enum" as const,
    label: "Difficulty",
    options: ["easy", "hard"] as const,
    default: "easy",
  },
} as const;

type S = SettingsOf<typeof galaxiesSettings>;

export const galaxiesPuzzlePlugin: GamePlugin<GalaxiesState, GalaxiesAction, typeof galaxiesSettings> = {
  id: "galaxies-puzzle",
  title: "Galaxies",
  category: "board",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Divide the grid into rotationally-symmetric regions, one per galaxy center star.",
  howToPlay: `Galaxies (also known as Tentai Show or Spiral Galaxies) is a Japanese partition puzzle. A grid of cells contains several star markers — each star marks the center of a galaxy region. Your task is to color every cell with a galaxy color so that the entire grid is divided into exactly one region per star.

Each region must obey one key rule: it must be 180°-rotationally symmetric around its star. That means if a cell at distance and direction D from the star is in the region, then the cell at distance D in the opposite direction must also be in the region. A single-cell region centered on a star is trivially symmetric.

How to play: click a numbered button in the color palette to select a galaxy. Then click grid cells to paint them that color. Clicking a cell already painted with the selected color clears it back to unassigned.

Strategy: stars near the edge or corner restrict how large their galaxy can grow. For any cell, the only valid galaxy is the one whose star lies equidistant in the opposite direction. Cross-reference multiple star constraints to determine the exact boundary of each region.

Click Reset to start over.`,
  settings: galaxiesSettings,
  initialState: (seed: number, settings: S) => initialState(seed, settings),
  reducer,
  isTerminal,
  hint: (): HintTarget | null => (typeof document !== "undefined" && document.querySelector(".galaxies-grid")) ? { selector: ".galaxies-grid", pulses: 3 } : null,
  component: Galaxies,
};
