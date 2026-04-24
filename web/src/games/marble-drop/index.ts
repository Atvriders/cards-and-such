import type { GamePlugin } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { MarbleDropState, MarbleDropAction } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { MarbleDrop } from "./MarbleDrop.js";

export const marbleDropSettings = {
  marbles: {
    kind: "enum" as const,
    label: "Marbles",
    options: ["5", "10", "15"] as const,
    default: "10" as const,
  },
} as const;

type MarbleDropSettingsType = SettingsOf<typeof marbleDropSettings>;

export const marbleDropPlugin: GamePlugin<MarbleDropState, MarbleDropAction, typeof marbleDropSettings> = {
  id: "marble-drop",
  title: "Marble Drop",
  category: "arcade",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Drop marbles through a peg maze and watch them bounce into scoring slots. Aim for the 50-point centre!",
  howToPlay: `Click anywhere in the upper portion of the board to drop a marble at that horizontal position. The marble falls under gravity, bouncing off the triangular array of pegs according to elastic collision physics. Each bounce deflects the marble left or right based on the exact impact angle.

At the bottom are seven scoring slots: outer slots score 5 points, middle slots score 10 or 20, and the centre slot pays a whopping 50 points. Unlike Plinko (which uses random decisions), Marble Drop uses real physics — small differences in your drop position lead to different trajectories, so the same spot dropped twice can yield different results if the marble hits a peg near its edge.

Strategy: dropping near the centre tends to funnel marbles toward higher-value slots more often, because the peg layout is symmetric and the centre column has fewer deflection opportunities. Dropping from the edges often pushes marbles toward the outer low-value slots.

Choose 5, 10, or 15 marbles. You can drop multiple marbles before they all settle — they interact with each other! The game ends when all marbles have come to rest. Aim for a centre-biased strategy and try to score 300+ with 10 marbles.`,
  settings: marbleDropSettings,
  initialState: (seed: number, settings: MarbleDropSettingsType) => initialState(seed, settings),
  reducer,
  isTerminal,
  component: MarbleDrop,
};
