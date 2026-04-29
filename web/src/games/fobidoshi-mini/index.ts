import type { GamePlugin } from "../../platform/game-plugin/types.js";
import type { FobidoshiMiniState, FobidoshiMiniAction, FobidoshiMiniSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { FobidoshiMiniGame } from "./Game.js";
const settings = { dummy: { kind: "boolean" as const, label: "dummy", default: false } } as const;
export const fobidoshiMiniPlugin: GamePlugin<FobidoshiMiniState, FobidoshiMiniAction, typeof settings> = {
  id: "fobidoshi-mini",
  title: "Fobidoshi Mini",
  category: "board",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Place circles of given group sizes in regions; no group adjacent.",
  howToPlay: "Fobidoshi is a Japanese-style placement puzzle. The grid contains regions, each with a number indicating how many circles to place inside the region. The catch: no two circles from different regions can be adjacent (orthogonally — sharing an edge).\n\nIn this mini version each puzzle shows a small grid with one or two regions partially filled. The prompt asks where one specific circle can be placed without violating the adjacency rule.\n\nGameplay: read the prompt, examine the grid, pick the cell that satisfies both the count constraint (right region size) and the adjacency constraint (no neighbor circles). Six puzzles per round.\n\nScoring is 100 points per correct answer plus a 10-point time bonus per remaining second. Wrong picks reveal the correct cell. Fobidoshi rewards careful reading of region boundaries — circles from the same region can be adjacent to each other, but the cross-region rule is strict. After a few puzzles the deduction pattern becomes second nature: count first, then check borders, then commit.",
  settings,
  initialState: (seed: number) => initialState(seed, { dummy: true } as FobidoshiMiniSettings),
  reducer,
  isTerminal,
  component: FobidoshiMiniGame,
};
