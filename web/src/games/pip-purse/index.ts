import type { GamePlugin } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { PipPurseState, PipPurseAction, PipPurseSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { PipPurseGame } from "./Game.js";
const settings = { dummy: { kind:"boolean" as const, label:"dummy", default:false } } as const;
type S = SettingsOf<typeof settings>;
export const pipPursePlugin: GamePlugin<PipPurseState, PipPurseAction, typeof settings> = {
  id:"pip-purse", title:"Pip Purse", category:"cards",
  players:{ min:1, max:1, multiplayer:false },
  description:"Sum five random cards' pip values. Lower-than-20 totals score points.",
  howToPlay:`Pip Purse is a tiny card-counting game with a low-score-wins twist. Each round, five cards are dealt face-up. Sum their pip values: 2 through 10 are worth their face value; Jack is 11; Queen is 12; King is 13; and Ace is a friendly 1.

If your total is under 20, you score 50 minus twice the sum (so a sum of 5 scores 40, while a sum of 19 scores just 12). Totals of 20 or more score zero. The Ace's value of 1 is a real gift — hands with multiple Aces and small numbers are gold.

You play 8 rounds. There's no choice within a round; it's pure draw-and-tally. Average sums tend to land around 35, so don't be surprised if you score zero on most rounds — but when fortune deals five small cards, you'll feel like you've found money in the couch cushions!`,
  settings,
  initialState:(seed:number,s:S)=>initialState(seed,s as PipPurseSettings),
  reducer,isTerminal,component:PipPurseGame,
};
