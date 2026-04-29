import type { GamePlugin } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { ChallengeYachtState, ChallengeYachtAction, ChallengeYachtSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { ChallengeYachtGame } from "./Game.js";
const settings = { dummy: { kind:"boolean" as const, label:"dummy", default:false } } as const;
type S = SettingsOf<typeof settings>;
export const challengeYachtPlugin: GamePlugin<ChallengeYachtState, ChallengeYachtAction, typeof settings> = {
  id: "challenge-yacht",
  title: "Challenge Yacht",
  category: "dice",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Two-reroll Yacht hand challenge. Pick your hand category and roll for the prize.",
  howToPlay: "Challenge Yacht reduces classic Yacht to a fast head-to-head call: predict whether two rolled dice will form a Doubles, a High Roll (sum 9 or more), or neither (Low Roll, sum 8 or less without doubles). Across 10 rounds you select one of the three calls before each roll.\n\nDoubles pays 40 points and occurs on 6 of 36 outcomes (16.7%). High Roll pays 15 points and is the second-most likely category at roughly 28%. Low Roll pays 10 points and is the most common at roughly 56%. The payout structure rewards riskier calls — calling Doubles three times in a row has roughly a 1-in-12 chance of working out for a single hit, but that hit nets you 40 over 30 if you'd called Low.\n\nNo rerolls, no scorecard, no bonuses. Just call and roll. After 10 rounds the game ends and your score is recorded. Average score lands around 100 points; experts intentionally call Doubles when chasing leaderboard runs.",
  settings,
  initialState: (seed: number, s: S) => initialState(seed, s as ChallengeYachtSettings),
  reducer,
  isTerminal,
  component: ChallengeYachtGame,
};
