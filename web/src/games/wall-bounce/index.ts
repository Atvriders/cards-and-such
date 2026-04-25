import type { GamePlugin } from "../../platform/game-plugin/types.js";
import type { WallBounceState, WallBounceAction } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { WallBounce } from "./WallBounce.js";

export const wallBouncePlugin = {
  id: "wall-bounce",
  title: "Wall Bounce",
  category: "arcade",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Choose a bounce angle to knock down targets — all five in as few shots as possible!",
  howToPlay: `Wall Bounce is an arcade aim-and-shoot game where you fire a ball at a set of five targets along the opposite wall. The ball ricochets off the side walls before it reaches the targets, so the angle you choose determines which targets it hits.

Pick a bounce angle from 1 (shallow) to 5 (steep) using the slider, then press Shoot. Each angle follows a unique bounce path and can hit two of the five targets. Targets that get knocked down stay down — but unused shots are wasted, so plan carefully.

You have five shots per round. Knocking down a target earns 100 points. Knock all five down before your shots run out for a perfect score of 500.

The key skill is working out which combination of angles topples all five targets. Angles 1 and 3 both hit target 0, so you only need one of them — doubling up wastes a shot. Study the pattern, map out overlaps, and choose the five angles that give you complete coverage. With good planning every round is a clean sweep!`,
  settings: {} as Record<string, never>,
  initialState: (seed: number) => initialState(seed),
  reducer,
  isTerminal,
  component: WallBounce,
} as unknown as GamePlugin;
