import type { GamePlugin } from "../../platform/game-plugin/types.js";
import type { WolfState, WolfAction, WolfSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { WolfAndSheep } from "./Game.js";

const settings = {} as const;

export const wolfAndSheepPlugin: GamePlugin<WolfState, WolfAction, typeof settings> = {
  id: "wolf-and-sheep",
  title: "Wolf and Sheep",
  category: "board",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Four sheep vs one wolf on a checkerboard. Trap the wolf before it breaks through.",
  howToPlay: `Wolf and Sheep is an asymmetric strategy game played on the dark squares of a standard 8×8 checkerboard. You command four sheep; the bot plays one wolf.

The four sheep start on the dark squares of the top row. The wolf starts near the bottom. The sheep move first, followed alternately by the wolf.

Sheep move diagonally forward (downward) only — they can never retreat. The wolf moves diagonally in any direction, one step at a time.

You win (as the sheep) by herding the wolf into a position where it has no legal moves — completely surrounded by sheep or board edges. The bot wins if the wolf reaches the top row (row 0) or breaks past all four sheep.

Strategy: keep your sheep in a tight diagonal line and advance as a unit. Never let gaps open between adjacent sheep. The wolf will try to find any crack to squeeze through. Use the board edges as walls to your advantage — cornering the wolf against an edge with two sheep is often decisive. Avoid moving a sheep so far forward that it becomes isolated.`,
  settings,
  initialState: (seed: number, s: WolfSettings) => initialState(seed, s),
  reducer,
  isTerminal,
  component: WolfAndSheep,
};
