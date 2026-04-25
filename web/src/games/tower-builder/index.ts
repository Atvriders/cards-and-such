import type { GamePlugin } from "../../platform/game-plugin/types.js";
import type { TowerBuilderState, TowerAction } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { TowerBuilderGame } from "./Game.js";

export const towerBuilderPlugin = {
  id: "tower-builder",
  title: "Tower Builder",
  category: "arcade",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Stack 20 swinging blocks as precisely as possible — the narrower the miss, the thinner the block!",
  howToPlay: `Tower Builder is a precision stacking arcade game. A block swings back and forth across the tower top. Your job is to drop it at exactly the right moment to land squarely on the previous block.

The dropped block is trimmed to only the overlapping portion between it and the block below. Miss entirely and the block falls off — game over! Land a perfect drop and the block stays full-width. Each subsequent block inherits the width of the trimmed result, so early mistakes compound.

You score points equal to the pixel overlap of each drop. Wide overlaps score high; narrow overlaps score low but keep the game going. Dropping a full-width block on a full-width tower earns 200 points.

The pendulum speeds up slightly with each successful placement, making precision harder as you climb. 20 levels of stacking await — the earlier you lose width, the harder later levels become.

Click Drop (or press Space) to release the swinging block. After each drop, click Continue to start the next swing. Your final score is based on total overlap points across all 20 levels. Build tall and aim true!`,
  settings: {} as const,
  initialState: (seed: number) => initialState(seed),
  reducer: reducer as (state: TowerBuilderState, action: TowerAction) => TowerBuilderState,
  isTerminal,
  component: TowerBuilderGame,
} as unknown as GamePlugin;
