import type { GamePlugin, SettingsOf } from "../../platform/game-plugin/types.js";
import type { HorseRace2d6State, HorseRace2d6Action, HorseRace2d6Settings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { HorseRace2d6Game } from "./Game.js";
const settings = { dummy: { kind:"boolean" as const, label:"dummy", default:false } } as const;
type S = SettingsOf<typeof settings>;
export const horseRace2d6Plugin: GamePlugin<HorseRace2d6State, HorseRace2d6Action, typeof settings> = {
  id: "horse-race-2d6",
  title: "Horse Race 2d6",
  category: "dice",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Bet a 'horse' (sum) — win when your sum rolls.",
  howToPlay: "Horse Race is the classic two-dice party game: each 'horse' is numbered 2 through 12, and the horse advances when its sum is rolled. This adaptation simplifies betting to three horses. Across 12 rounds two dice are rolled. Bet on a horse: Horse 7 (the modal sum, 16.7% of rolls) pays +8 — the safe favorite. Horses 5 or 9 (each 11.1%) together pay +18 when one shows. Horses 2 or 12 (each 2.8%) pay +45 — the long shots. Other rolls pay zero. Strategy: never-7 punters lose money fast since 7 is statistically more frequent than any other sum. The +45 long-shot pays off about 5.6% of rolls combined — over twelve rounds you expect about 0.7 hits, worth +30 on average. Steady Horse 7 picks expect +16 per twelve rounds. The middle band offers the best risk/reward at roughly +30. Twelve rounds, top score wins. The classroom version shows dice-sum probability.",
  settings,
  initialState: (seed: number, s: S) => initialState(seed, s as HorseRace2d6Settings),
  reducer,
  isTerminal,
  component: HorseRace2d6Game,
};
