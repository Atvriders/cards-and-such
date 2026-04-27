import type { GamePlugin } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { LowTideState, LowTideAction, LowTideSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { LowTideGame } from "./Game.js";
const settings = { dummy: { kind:"boolean" as const, label:"dummy", default:false } } as const;
type S = SettingsOf<typeof settings>;
export const lowTidePlugin: GamePlugin<LowTideState, LowTideAction, typeof settings> = {
  id:"low-tide", title:"Low Tide", category:"cards",
  players:{ min:1, max:1, multiplayer:false },
  description:"Eight rounds of five-card hands. Lower sums score higher — chase the small numbers.",
  howToPlay:`Low Tide is a quick eight-round card game where small numbers reign. Each round, you are dealt five random cards. Your hand sum determines your score for the round: each round earns max(0, 100 minus twice the pip sum).

Pip values follow standard convention: 2 through 10 are face value, Jack is 11, Queen is 12, King is 13, and Ace is a friendly 1. So a hand of 2-3-4-5-A scores big — sum 15 means 70 points. A hand full of face cards (J-Q-K-K-Q for example) sums 60+, scoring zero.

There are no choices to make within a round; it is pure draw and tally. Aces are gold; small spot cards are silver. Average hand sums are roughly 35, scoring 30 per round, so an expected total around 240 over eight rounds.

Watch your bankroll grow round by round, and pray for those small spot cards and aces!`,
  settings,
  initialState:(seed:number,s:S)=>initialState(seed,s as LowTideSettings),
  reducer,isTerminal,component:LowTideGame,
};
