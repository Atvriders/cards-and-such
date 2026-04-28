import type { GamePlugin } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { DiceMysticState, DiceMysticAction, DiceMysticSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { DiceMysticGame } from "./Game.js";
const settings = { dummy: { kind:"boolean" as const, label:"dummy", default:false } } as const;
type S = SettingsOf<typeof settings>;
export const diceMysticPlugin: GamePlugin<DiceMysticState, DiceMysticAction, typeof settings> = {
  id:"dice-mystic", title:"Dice Mystic", category:"dice",
  players:{ min:1, max:1, multiplayer:false },
  description:"Roll with multiplier: risk for higher payouts.",
  howToPlay:"Dice Mystic rolls 2 dice each round across 10 rounds, but you must pre-pick a multiplier first: x1 (sum always pays), x2 (pays sum times 2 only if even sum), or x3 (pays sum times 3 only if doubles, i.e. matching pair).\n\nTap your multiplier: the dice are then rolled and the result revealed. Press Next to advance.\n\nMath: x1 average payout is 7 (the average sum of 2 dice). x2 hits half the time (even sums are 50 percent) for an average payout of 7 (0.5 times 7 times 2). x3 hits 1 of 6 of the time (any pair) for an average payout of 3.5 (1 of 6 times 7 times 3). So x1 and x2 are equivalent in expected value (about 7), while x3 is roughly half (about 3.5) but with massive max payouts of 36 (double sixes times 3).\n\nAcross 10 rounds, x1 and x2 strategy yields about 70 points; pure x3 strategy yields about 35 but with high variance. Mix and match! Dice Mystic rewards strategic risk-taking: chase those doubles for the big finish or play it safe for steady gains.",
  settings,
  initialState:(seed:number,s:S)=>initialState(seed,s as DiceMysticSettings),
  reducer,isTerminal,component:DiceMysticGame,
};
