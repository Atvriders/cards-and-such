import type { GamePlugin } from "../../platform/game-plugin/types.js";
import type { ShisenShoState, ShisenAction } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { ShisenSho } from "./ShisenSho.js";

const settings = {} as const;

export const shisenShoPlugin: GamePlugin<ShisenShoState, ShisenAction, typeof settings> = {
  id: "shisen-sho",
  title: "Shisen-Sho",
  category: "board",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Match Mahjong tile pairs connected by a path of at most 2 turns through empty space.",
  howToPlay: `Shisen-Sho (Four Rivers) is a Japanese tile-matching game played on a 12×8 flat grid of 96 Mahjong tiles arranged face-up with no stacking.

Click any tile to select it (highlighted blue), then click another tile with the same face. The two tiles are removed only if they can be connected by a path that makes at most 2 turns and passes only through empty cells. Paths may go through the empty border surrounding the entire board, giving extra routing options near the edges.

If the second tile does not match, or no valid connecting path exists, it becomes the new selection. Plan several moves ahead — as tiles are removed, new paths open up that were previously blocked.

You win when all 96 tiles are cleared. The game ends early when no matching pair on the board can be connected under the path rules, so avoid removing pairs that create isolated clusters.

Score: 5,000 minus 30 per move on a full clear; partial credit proportional to tiles removed. Fewer total moves means a higher score — look for efficient clusters where removing one pair opens several others. Hint: start from dense areas and work outward to keep paths available.`,
  settings,
  initialState: (seed: number) => initialState(seed),
  reducer,
  isTerminal,
  component: ShisenSho,
};
