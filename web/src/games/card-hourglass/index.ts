import type { GamePlugin } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { CardHourglassState, CardHourglassAction, CardHourglassSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { CardHourglassGame } from "./Game.js";
const settings = { dummy: { kind:"boolean" as const, label:"dummy", default:false } } as const;
type S = SettingsOf<typeof settings>;
export const cardHourglassPlugin: GamePlugin<CardHourglassState, CardHourglassAction, typeof settings> = {
  id:"card-hourglass", title:"Card Hourglass", category:"cards",
  players:{ min:1, max:1, multiplayer:false },
  description:"Score when 5 cards form an hourglass dip-then-climb pattern.",
  howToPlay:"Card Hourglass deals you 5 random cards each round. If their ranks form an hourglass — descending to a low middle then ascending back up (e.g. K-7-3-7-J) — you score 40 points. Otherwise 0. There are 10 rounds total.\n\nThe probability of a hand forming an hourglass is small (~1 in 30, depending on rank repeats), so a typical game scores 30-80 points; great runs break 150. The unique pattern makes payoffs feel earned and satisfying.\n\nPress Deal to flip the 5 cards, then Next to advance. The hand is shown as dealt — your job is to spot the dip-then-climb shape. Across 10 rounds, the rhythm of dealing-and-checking is quick and addictive. A more pattern-focused twin to Stairway and Downstairs. Hourglass time!",
  settings,
  initialState:(seed:number,s:S)=>initialState(seed,s as CardHourglassSettings),
  reducer,isTerminal,component:CardHourglassGame,
};
