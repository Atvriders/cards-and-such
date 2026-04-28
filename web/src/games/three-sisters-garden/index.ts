import type { GamePlugin, SettingsOf } from "../../platform/game-plugin/types.js";
import type { ThreeSistersGardenState, ThreeSistersGardenAction, ThreeSistersGardenSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { ThreeSistersGardenGame } from "./Game.js";
const settings = { dummy: { kind: "boolean" as const, label: "dummy", default: false } } as const;
type S = SettingsOf<typeof settings>;
export const threeSistersGardenPlugin: GamePlugin<ThreeSistersGardenState, ThreeSistersGardenAction, typeof settings> = {
  id: "three-sisters-garden",
  title: "Three Sisters Garden",
  category: "board",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Plant corn/beans/squash via dice in a 4x4 garden over rotations.",
  howToPlay: `Three Sisters is a garden roll-and-write. In this adaptation you plant 3 crops (corn, beans, squash) in a 4x4 garden over 12 rolls. Each turn you roll 1d6, then choose corn (1-2), beans (3-4), or squash (5-6) based on the roll, and click any empty cell to plant it.

The Three Sisters companion-planting bonus: corn supports beans, beans nitrogen-fix soil, squash shades.

Scoring (at end):
• Each corn cell: +1; +2 bonus per corn cell adjacent to a bean
• Each bean cell: +1; +2 bonus per bean cell adjacent to a corn
• Each squash cell: +1; +3 bonus per squash cell on a row that has both corn and beans
• Bonus +10 per row containing all three types
• Bonus +15 if all 4 rows have at least one of each type (full diversity)

The game runs 12 rolls. Plant in mixed clusters to score the companion bonuses. A strong garden scores 30-50 points. The sister synergy is the core mechanic — pure corn or pure beans is wasted potential.`,
  settings,
  initialState: (seed: number, s: S) => initialState(seed, s as ThreeSistersGardenSettings),
  reducer,
  isTerminal,
  component: ThreeSistersGardenGame,
};
