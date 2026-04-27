import type { GamePlugin } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { PipFiveState, PipFiveAction, PipFiveSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { PipFiveGame } from "./Game.js";
const settings = { dummy: { kind:"boolean" as const, label:"dummy", default:false } } as const;
type S = SettingsOf<typeof settings>;
export const pipFivePlugin: GamePlugin<PipFiveState, PipFiveAction, typeof settings> = {
  id:"pip-five", title:"Pip Five", category:"cards",
  players:{ min:1, max:1, multiplayer:false },
  description:"Sum five cards each round. Aim for the target of 25; closer earns more points across 8 rounds.",
  howToPlay:`Pip Five is a quick eight-round card-counting mini. Each round, five cards are dealt face-up. Sum their pip values: 2 through 10 are worth their face value; Jack, Queen, and King are each worth 10; and the Ace counts as 1. The target sum is 25.

Your score for the round is 30 minus twice the absolute distance from 25. So a sum of exactly 25 earns the maximum 30 points; sums of 24 or 26 earn 28; sums of 20 or 30 each earn 20; and big misses score zero. The math rewards consistent middle-of-the-road hands more than wild fortune.

There are 8 rounds. There's no in-round choice — it's pure draw-and-tally. Average sums tend to land around 30-35 because face cards and tens cluster on the high side, so look for hands rich in small numbers. The maximum score per round is 30; a perfect game would be 240.`,
  settings,
  initialState:(seed:number,s:S)=>initialState(seed,s as PipFiveSettings),
  reducer,isTerminal,component:PipFiveGame,
};
