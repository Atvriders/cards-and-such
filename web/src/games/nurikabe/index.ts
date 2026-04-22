import type { GamePlugin } from "../../platform/game-plugin/types.js";
import type { NurikabeState, NurikabeAction, NurikabeSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { Nurikabe } from "./Game.js";

export const nurikabeSettings = {
  difficulty: {
    kind: "enum" as const,
    label: "Difficulty",
    options: ["easy", "medium", "hard"] as const,
    default: "easy",
  },
} as const;

export const nurikabePlugin: GamePlugin<NurikabeState, NurikabeAction, typeof nurikabeSettings> = {
  id: "nurikabe",
  title: "Nurikabe",
  category: "board",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Shade cells to form a connected sea. Numbered cells anchor islands whose size matches their number.",
  howToPlay: `Nurikabe is a logic puzzle about separating white islands from a black sea. The grid contains numbered clue cells. Your goal is to shade cells black (sea) or leave them white (island) following these rules:

1. Each numbered cell belongs to a white island whose total size (in cells) exactly equals its number. Islands do not touch each other orthogonally.
2. All black shaded cells form one single connected sea — no isolated groups.
3. The sea must not contain any 2×2 block of fully shaded cells.

To play: click any cell to cycle it through unknown → shaded (black sea) → unshaded (white island) → unknown. Numbered clue cells are the roots of their islands; you still need to shade cells around them appropriately.

Start by identifying cells that must be sea: clues far apart leave no room for islands to meet, so cells between them are forced sea. Any 2×2 region where shading it would create a forbidden block must be broken up.

Difficulty controls grid size and number of clues: Easy is 6×6, Medium is 8×8, Hard is 9×9.

Score = max(100, 1000 − moves × 3). Fewer moves yield a higher score.`,
  settings: nurikabeSettings,
  initialState: (seed: number, s: NurikabeSettings) => initialState(seed, s),
  reducer,
  isTerminal,
  component: Nurikabe,
};
