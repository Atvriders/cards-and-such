import type { GamePlugin } from "../../platform/game-plugin/types.js";
import type { MontyHallState, MontyHallAction, MontyHallSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { MontyHallGame } from "./Game.js";

const settings = {} as const;

export const montyHallPlugin: GamePlugin<MontyHallState, MontyHallAction, typeof settings> = {
  id: "monty-hall",
  title: "Monty Hall",
  category: "board",
  players: { min: 1, max: 1, multiplayer: false },
  description: "The famous probability paradox — pick a door, see a goat, then decide: switch or stay?",
  howToPlay: `The Monty Hall Problem is one of history's most famous probability puzzles, named after the host of the TV show Let's Make a Deal.

Here's the setup: there are three doors. Behind one is a car; behind the other two are goats. You pick a door. Then the host — who knows what's behind each door — opens one of the other two doors to reveal a goat. Now you face a choice: stick with your original door, or switch to the remaining unopened door.

Most people's instinct is that it doesn't matter — 50/50, right? Wrong! Switching wins 2 out of 3 times. Here's why: when you first picked, you had a 1/3 chance of being right. That means there's a 2/3 chance the car is in one of the other two doors. When Monty removes the goat, that entire 2/3 probability shifts to the one remaining door. Switching captures it.

Play many rounds and watch the statistics panel. You'll see that switching wins roughly 67% of the time, while staying wins only 33%. Explore the paradox first-hand and build the mathematical intuition that even professional mathematicians initially got wrong!`,
  settings,
  initialState: (seed: number, s: MontyHallSettings) => initialState(seed, s),
  reducer,
  isTerminal,
  component: MontyHallGame,
};
