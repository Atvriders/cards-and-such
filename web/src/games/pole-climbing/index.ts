import type { GamePlugin } from "../../platform/game-plugin/types.js";
import type { PoleState, PoleAction } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { PoleClimbing } from "./Game.js";

export const poleClimbingPlugin = {
  id: "pole-climbing",
  title: "Pole Climbing",
  category: "arcade",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Alternate left and right grips to scale a pole. Build a combo for maximum speed, dodge the rocks along the way, and reach the top without falling!",
  howToPlay: `Pole Climbing is a rhythm arcade game where you scale a vertical pole by alternating your hand grips. The pole is 100 units tall and obstacles (rocks) jut out from alternating sides to block your arms.

Click Left Grip and Right Grip alternately to climb. Every time you correctly alternate (left after right, or right after left) your Combo counter increases and you get a bigger speed boost. Using the same arm twice in a row breaks your combo and gives a much smaller boost.

Speed decays naturally every tick due to gravity — you must keep gripping to maintain your upward momentum. Your Energy bar also depletes with each grip and slowly recovers over time. If energy falls below 20%, your effective climbing speed is cut dramatically.

Obstacles appear along the pole. If you use the grip that matches an obstacle's side while it's close to your position, you take a hit: your speed drops, you lose extra energy, and your fall counter increments. Dodge by using the opposite arm.

Reaching the top wins the round. Your score is based on how few falls you had: a perfect climb with zero falls scores 100 points. Each fall deducts 10 points.`,
  settings: {} as const,
  initialState: (seed: number) => initialState(seed),
  reducer: reducer as (state: PoleState, action: PoleAction) => PoleState,
  isTerminal,
  component: PoleClimbing,
} as unknown as GamePlugin;
