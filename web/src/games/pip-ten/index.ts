import type { GamePlugin } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { PipTenState, PipTenAction, PipTenSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { PipTenGame } from "./Game.js";
const settings = { dummy: { kind:"boolean" as const, label:"dummy", default:false } } as const;
type S = SettingsOf<typeof settings>;
export const pipTenPlugin: GamePlugin<PipTenState, PipTenAction, typeof settings> = {
  id:"pip-ten", title:"Pip Ten", category:"cards",
  players:{ min:1, max:1, multiplayer:false },
  description:"Deal 10 cards each round; score by how close their pip total is to 50.",
  howToPlay:`Pip Ten plays like its little cousin Pip Five but the hand is doubled. Each round, ten cards are dealt face-up. Sum their pip values: 2 through 10 are worth their face value; Jack, Queen, and King are each worth 10; and the Ace counts as 1. The target sum is 50.

Your score for the round is 40 minus twice the absolute distance from 50. So a sum of exactly 50 earns the maximum 40 points; sums of 48 or 52 earn 36; large misses score zero.

There are 8 rounds and no in-round choices — it's pure draw-and-tally. Average sums tend to land in the 60s because face cards and tens cluster at the top end, so be on the lookout for hands rich in twos, threes, fours, and friendly aces. With ten cards the variance smooths out compared to Pip Five, so consistently good hands earn steady mid-range scores. The maximum total is 320.`,
  settings,
  initialState:(seed:number,s:S)=>initialState(seed,s as PipTenSettings),
  reducer,isTerminal,hint: (state) => isTerminal(state) ? null : ({ selector: '[data-testid="hint-target-pip-ten-primary"]', pulses: 3 }),component:PipTenGame,
};
