import type { GamePlugin } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { DiceBaseballState, DiceBaseballAction } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { DiceBaseball } from "./DiceBaseball.js";

export const diceBaseballSettings = {
  innings: {
    kind: "enum" as const,
    label: "Innings",
    options: ["3", "6", "9"] as const,
    default: "9",
  },
} as const;

type DiceBaseballSettingsType = SettingsOf<typeof diceBaseballSettings>;

export const diceBaseballPlugin: GamePlugin<DiceBaseballState, DiceBaseballAction, typeof diceBaseballSettings> = {
  id: "dice-baseball",
  title: "Dice Baseball",
  category: "dice",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Simulate a full baseball game with two dice — roll each at-bat and see how many runs you score!",
  howToPlay: `Dice Baseball simulates a 3, 6, or 9 inning baseball game using two standard dice rolled together each at-bat.

The sum of the two dice determines what happens: sum of 2 or 12 = Home Run (batter and all runners score); 3 = Triple (batter advances to third, runners score); 4 = Double (batter to second, runners advance two bases); 5 or 9 = Single (batter to first, runners advance one base); 10 = Walk (same as single); 6 or 8 = Fly Out; 7 = Ground Out (double play if a runner is on first — costs two outs!); 11 = Strike Out.

Three outs end the inning. Runners advance along the bases as hits push them forward — a runner on second scores on a double, but may need a single to score from first. Your final score is 100 points per run scored across the whole game.

The game is purely random but deeply satisfying: a grand slam on the last roll of the ninth can turn a shutout into a triumph!`,
  settings: diceBaseballSettings,
  initialState: (seed: number, settings: DiceBaseballSettingsType) => initialState(seed, settings),
  reducer,
  isTerminal,
  component: DiceBaseball,
};
