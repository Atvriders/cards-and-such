import type { GamePlugin } from "../../platform/game-plugin/types.js";
import type { BarrelJumperState, BarrelJumperAction } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { BarrelJumper } from "./BarrelJumper.js";

export const barrelJumperPlugin: GamePlugin<BarrelJumperState, BarrelJumperAction, Record<never, never>> = {
  id: "donkey-kong-like",
  title: "Barrel Jumper",
  category: "arcade",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Climb platforms and jump over rolling barrels to reach the top.",
  howToPlay: `Run across multi-story scaffolding and reach the glowing star at the top while barrels rain down from above.

Move left and right with the arrow keys or A/D. Press Space or W to jump over incoming barrels. When you reach a ladder (indicated by the rungs between floors), press F or the Climb button to ascend to the next platform. Ladders only go up — plan your path accordingly.

Barrels spawn from the upper-right every few seconds and roll left along each platform before falling to the one below. Touching a barrel costs you a life and sends you back to the bottom. You start with three lives.

Your score increases passively while you stay alive, with a lives bonus when you reach the goal. Reach the star on the top platform to win.

Tips: Barrels are spaced out but their timing is random — watch the spawn pattern. Jump as late as possible to guarantee the barrel has passed. When a barrel drops off a ledge, it briefly becomes airborne; do not stand at the far-left edge or you may collide with a falling barrel. Ladders are located at alternating ends of each floor, so you need to zigzag across each platform to reach the next ladder.`,
  settings: {} as Record<never, never>,
  initialState: (seed: number) => initialState(seed),
  reducer,
  isTerminal,
  component: BarrelJumper,
};
