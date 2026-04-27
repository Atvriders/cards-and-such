import type { GamePlugin } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { HighTideState, HighTideAction, HighTideSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { HighTideGame } from "./Game.js";
const settings = { dummy: { kind:"boolean" as const, label:"dummy", default:false } } as const;
type S = SettingsOf<typeof settings>;
export const highTidePlugin: GamePlugin<HighTideState, HighTideAction, typeof settings> = {
  id:"high-tide", title:"High Tide", category:"cards",
  players:{ min:1, max:1, multiplayer:false },
  description:"Eight rounds of five-card hands. Higher sums score higher — chase the face cards.",
  howToPlay:`High Tide is the upbeat sibling of Low Tide: in this version, big numbers win. Each round, you are dealt five random cards. The hand sum is computed using high-ace conventions — Aces are 14, Kings 13, Queens 12, Jacks 11, and 2 through 10 are face value. The score per round is max(0, twice the sum minus 30).

So a sum of 20 scores just 10. A sum of 50 (rare but possible — five face cards) scores 70. Average sums are around 40 with high-ace, scoring roughly 50 per round.

There are no choices to make — it is pure draw and tally over 8 rounds. The deck shuffles uniquely per round (no card duplicates within a round, but cards can repeat across rounds).

Watch your bankroll grow with kings and aces. Pray for face card combinations and avoid the dreaded all-deuces hand. Eight rounds and you are done — let the high tide come in!`,
  settings,
  initialState:(seed:number,s:S)=>initialState(seed,s as HighTideSettings),
  reducer,isTerminal,component:HighTideGame,
};
