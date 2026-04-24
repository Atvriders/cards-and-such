import type { GamePlugin } from "../../platform/game-plugin/types.js";
import type { IceBlocksState, IceBlocksAction } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { IceBlocks } from "./IceBlocks.js";

export const iceBlocksPlugin: GamePlugin<IceBlocksState, IceBlocksAction, Record<never, never>> = {
  id: "pengo-like",
  title: "Ice Blocks",
  category: "arcade",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Slide ice blocks to crush and freeze enemies on an arctic grid.",
  howToPlay: `Navigate a grid of ice blocks and destroy enemies by pushing blocks into them.

Move with the arrow keys or WASD. Press Space or F to push an ice block in the direction you are facing. A pushed block slides in a straight line until it hits a wall or another block. Any enemy hit by a sliding block is instantly frozen. A second push action while an enemy is frozen will shatter it for points.

Three diamonds are hidden in the level — collect them by walking over the cells where they appear. Yellow cells indicate a diamond. Collecting all diamonds and defeating all four enemies wins the round.

You can also stun enemies by pressing against a wall — pushing the wall stuns nearby enemies for a few seconds. Frozen or stunned enemies cannot hurt you, but they thaw after a timer runs out. You have three lives; touching an active (unfrozen) enemy costs one.

Scoring: 400 points per enemy killed by block, 200 per enemy stunned against a wall, 500 per diamond collected. Lives bonus on victory. Use the grid edges to trap enemies for easier kills.`,
  settings: {} as Record<never, never>,
  initialState: (seed: number) => initialState(seed),
  reducer,
  isTerminal,
  component: IceBlocks,
};
