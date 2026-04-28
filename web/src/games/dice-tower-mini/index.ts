import type { GamePlugin } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { DiceTowerMiniState, DiceTowerMiniAction, DiceTowerMiniSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { DiceTowerMiniGame } from "./Game.js";
const settings = { dummy: { kind:"boolean" as const, label:"dummy", default:false } } as const;
type S = SettingsOf<typeof settings>;
export const diceTowerMiniPlugin: GamePlugin<DiceTowerMiniState, DiceTowerMiniAction, typeof settings> = {
  id:"dice-tower-mini", title:"Dice Tower Mini", category:"dice",
  players:{ min:1, max:1, multiplayer:false },
  description:"Roll dice toward target sum 7. Closer = bigger score. 8 rounds.",
  howToPlay:"Dice Tower Mini puts a target on the value 7 — the most-likely sum of two dice. Each round, you roll two six-sided dice. Your score is 14 minus twice the absolute distance from 7, capped at zero. So a sum of 7 = 14, sum of 6 or 8 = 12, sum of 5 or 9 = 10, sum of 4 or 10 = 8, sum of 3 or 11 = 6, sum of 2 or 12 = 2.\n\nThe probabilities favor scores: 7 happens 6/36 = 17% of the time, 6 or 8 each 14%, 5 or 9 each 11%, etc. So your expected per-round score is around 9-10, putting your average 8-round total at 72-82.\n\nMaximum theoretical: 112 (all sevens, lucky 17% × 8 streak). Worst case: 16 (all 2s and 12s, vanishingly rare).\n\nThere's no choice — just roll and let the bell curve do its work. Welcome to dice statistics!",
  settings,
  initialState:(seed:number,s:S)=>initialState(seed,s as DiceTowerMiniSettings),
  reducer,isTerminal,component:DiceTowerMiniGame,
};
