import type { GamePlugin } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { Countdown321State, Countdown321Action, Countdown321Settings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { Countdown321Game } from "./Game.js";
const settings = { dummy: { kind:"boolean" as const, label:"dummy", default:false } } as const;
type S = SettingsOf<typeof settings>;
export const countdown321Plugin: GamePlugin<Countdown321State, Countdown321Action, typeof settings> = {
  id: "countdown-321",
  title: "3-2-1 Countdown",
  category: "dice",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Roll three dice. Score by collecting a 3, then a 2, then a 1 in order.",
  howToPlay: "3-2-1 Countdown is a Yahtzee cousin where each round rolls three dice and you score based on the highest count of the right pattern. The pattern is: a 3, a 2, and a 1 — in that order — across the three dice.\n\nEach round you check whether the three dice contain at least one 3, one 2, and one 1. If yes, the round scores 30. If two of the three target values are present (any combination), the round scores 12. If only one is present, the round scores 5. If none are present, the round scores 0.\n\nNo prediction or call needed — the game scores automatically each round so you watch your countdown progress. The game runs 10 rounds. Average expected score hovers near 90 points. The probability of all three target values in a single roll is 6/216 (2.8%); two values present is much higher (around 30%); at least one is around 70%. Plain mechanical scoring with a satisfying climb across 10 short rounds.",
  settings,
  initialState: (seed: number, s: S) => initialState(seed, s as Countdown321Settings),
  reducer,
  isTerminal,
  component: Countdown321Game,
};
