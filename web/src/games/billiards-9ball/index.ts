import type { GamePlugin } from "../../platform/game-plugin/types.js";
import { initialState, reducer, isTerminal, type Billiards9BallState, type Billiards9BallAction } from "./state.js";
import { Billiards9Ball } from "./Game.js";

export const billiards9BallSettings = {
  difficulty: { kind: "enum" as const, label: "Difficulty", options: ["easy", "medium", "hard"] as const, default: "medium" as const },
} as const;

export const billiards9BallPlugin: GamePlugin<Billiards9BallState, Billiards9BallAction, typeof billiards9BallSettings> = {
  id: "billiards-9ball",
  title: "Billiards — 9 Ball",
  category: "board",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Pocket balls 1 through 9 in order. Sink the 9-ball after a legal hit to win.",
  howToPlay: `9-Ball Billiards is one of the most exciting pool variants. The table holds only 9 numbered balls (1–9), and you must always contact the lowest-numbered ball on the table first with every shot.

Your goal is to sink the 9-ball to win — but only after making a legal hit (striking the lowest ball first). You can pocket the 9-ball directly on a lucky combo off another ball, or work through the sequence clearing balls 1 through 8 first.

Each turn set your Aim angle (0.5 = center is ideal) and Power (0.65 is the sweet spot). Click Shoot. If your shot contacts the lowest ball legally you've made a valid strike. Whether you pocket a ball or not depends on the quality of your aim and power combined with seeded probability.

Fouls occur when you fail to contact the lowest ball first. Each foul is tracked and penalizes your final score. After each shot click Next Shot to continue.

Score = 1000 minus 5 per turn and 50 per foul. Perfect play (win fast, no fouls) gives the highest score. Difficulty controls how tight the aim/power tolerances are.`,
  settings: billiards9BallSettings,
  initialState,
  reducer,
  isTerminal,
  component: Billiards9Ball,
};
