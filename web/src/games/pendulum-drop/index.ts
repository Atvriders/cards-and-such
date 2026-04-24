import type { GamePlugin } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { PendulumDropState, PendulumDropAction } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { PendulumDrop } from "./PendulumDrop.js";

export const pendulumDropSettings = {
  swings: {
    kind: "enum" as const,
    label: "Swings",
    options: ["5", "8", "12"] as const,
    default: "8" as const,
  },
} as const;

type PendulumDropSettingsType = SettingsOf<typeof pendulumDropSettings>;

export const pendulumDropPlugin: GamePlugin<PendulumDropState, PendulumDropAction, typeof pendulumDropSettings> = {
  id: "pendulum-drop",
  title: "Pendulum Drop",
  category: "arcade",
  players: { min: 1, max: 1, multiplayer: false },
  description: "A ball swings on a pendulum — release it at the right moment to drop into the highest-scoring cup!",
  howToPlay: `A ball hangs from a pivot and swings left and right like a pendulum, following real angular physics — it speeds up at the bottom and slows near the apex, just like a real swing. Below are three coloured cups with different point values: outer cups score 10, and the special high-value cup (50 points) changes position each swing.

Your job is simple: watch the ball swing, judge the moment, and press RELEASE. The ball drops straight down from wherever it was when you released, with a small forward momentum from the swing. Gravity takes it the rest of the way to the cups.

The key skill is predicting where the ball will land. At the bottom of the swing the ball is moving fastest horizontally, so releasing at the bottom sends the ball sideways; releasing near the apex drops it more vertically. You must account for this horizontal carry to aim for a specific cup.

Choose 5, 8, or 12 swings per game. The high-value cup shuffles after each swing, so stay alert and adapt. Consistent landings in the 50-point cup require patient timing and sharp reflexes — aim for 300+ in 8 swings to reach expert level!`,
  settings: pendulumDropSettings,
  initialState: (seed: number, settings: PendulumDropSettingsType) => initialState(seed, settings),
  reducer,
  isTerminal,
  component: PendulumDrop,
};
