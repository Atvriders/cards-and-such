import type { GamePlugin } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { CaveState, CaveAction, CaveSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { Cave } from "./Cave.js";

export const caveSettings = {
  difficulty: {
    kind: "enum" as const,
    label: "Difficulty",
    options: ["easy", "hard"] as const,
    default: "easy",
  },
} as const;

type CaveSettingsType = SettingsOf<typeof caveSettings>;

export const cavePlugin: GamePlugin<CaveState, CaveAction, typeof caveSettings> = {
  id: "cave",
  title: "Cave",
  category: "board",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Shade cells so numbered clues count their visible unshaded cells; all unshaded cells stay connected.",
  howToPlay: `Cave (also called Corral) is a Japanese shading puzzle. The grid contains some numbered clue cells. Your goal is to shade some cells black so that three conditions are met.

First, each numbered clue cell must be unshaded, and its number equals the total count of unshaded cells visible from it in all four cardinal directions — including the clue cell itself. "Visible" means you count cells in a straight line until you hit a shaded cell or the grid edge.

Second, all unshaded cells must form a single connected group (no isolated white islands).

Third, all shaded cells must connect to the grid border — there can be no fully enclosed "island" of shaded cells surrounded by white space.

Click a cell to cycle through: empty (white) → shaded (black) → dot (·, a helper reminder) → empty. Clue numbers turn green when their visibility count matches the value.

Strategy: work from clues near edges first — they have fewer possible directions, narrowing the shading quickly. Use the connectivity rules to rule out configurations that would cut off groups of cells.`,
  settings: caveSettings,
  initialState: (seed: number, settings: CaveSettingsType) => initialState(seed, settings),
  reducer,
  isTerminal,
  component: Cave,
};
