import type { GamePlugin } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { DicePyramidState, DicePyramidAction, DicePyramidSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { DicePyramidGame } from "./Game.js";
const settings = { dummy: { kind:"boolean" as const, label:"dummy", default:false } } as const;
type S = SettingsOf<typeof settings>;
export const dicePyramidPlugin: GamePlugin<DicePyramidState, DicePyramidAction, typeof settings> = {
  id:"dice-pyramid", title:"Dice Pyramid", category:"dice",
  players:{ min:1, max:1, multiplayer:false },
  description:"Roll 6 dice arranged as a pyramid. Lower sums score more; +10 per 1.",
  howToPlay:`Dice Pyramid is a low-roll dice mini themed around a 1-2-3 stacked pyramid (6 dice total: one on top, two in the middle, three at the base). Each round you roll all six dice at once, sum the pips, and the lower your total the higher your score.

Score formula: 200 minus 5 times the sum, floored at zero. Plus a 10-point bonus for every 1 pip on the dice (which encourages low rolls naturally). The expected sum of 6d6 is 21, giving an expected base of 200 - 105 = 95 plus a typical 10 points of ones bonus = 105 average per round.

You play 6 rounds. Total expected scores land near 600 with normal luck; great rolls of mostly-1s could hit 250+ in a single round and shoot the total over 1000. Press Roll, see your pyramid, take your points. A meditative roll-and-watch game.`,
  settings,
  initialState:(seed:number,s:S)=>initialState(seed,s as DicePyramidSettings),
  reducer,isTerminal,component:DicePyramidGame,
};
