import { lazy } from "react";
import type * as React from "react";
import type { GamePlugin, HintTarget } from "../../platform/game-plugin/types.js";
import type { GalaxiesMiniState, GalaxiesMiniAction, GalaxiesMiniSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
const GalaxiesMiniGame = /* @__PURE__ */ lazy(() => import("./Game.js").then((mod) => ({ default: mod.GalaxiesMiniGame as unknown as React.ComponentType<unknown> })));
const settings = { dummy: { kind: "boolean" as const, label: "dummy", default: false } } as const;
export const galaxiesMiniPlugin: GamePlugin<GalaxiesMiniState, GalaxiesMiniAction, typeof settings> = {
  id: "galaxies-mini",
  title: "Galaxies Mini",
  category: "board",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Divide grid into rotationally symmetric regions around star centers.",
  howToPlay: "Galaxies (Tentai Show, Japanese for \"galactic show\") divides a grid into regions, each containing one star (the galaxy's center). Each region must be rotationally symmetric (180-degree symmetry) around its star.\n\nThe star can sit on a cell center, on an edge between two cells, or on a vertex shared by four cells. Regions can be any shape as long as 180-degree rotation around the star maps the region onto itself.\n\nIn this mini version each puzzle shows a small grid with stars placed. The prompt asks which cell belongs to a specific star's region, or whether a particular shape is a valid galaxy.\n\nSix puzzles per round, scoring 100 each plus a 10-point time bonus per remaining second. Wrong picks reveal the right answer.\n\nGalaxies trains rotational-symmetry intuition. A star at a cell center means the region has a center cell and pairs of cells equidistant on opposite sides. A star on an edge means cells come in mirrored pairs across that edge. Once you spot the symmetry pattern, regions snap into shape.",
  settings,
  initialState: (seed: number) => initialState(seed, { dummy: true } as GalaxiesMiniSettings),
  reducer,
  isTerminal,
  
  hint: (state: GalaxiesMiniState): HintTarget | null => state.phase === "playing" ? { selector: '[data-testid="hint-target-galaxies-mini-answer-0"]', pulses: 3 } : null,component: GalaxiesMiniGame,
};
