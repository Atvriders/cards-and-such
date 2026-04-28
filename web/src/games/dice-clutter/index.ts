import type { GamePlugin } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { DiceClutterState, DiceClutterAction, DiceClutterSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { DiceClutterGame } from "./Game.js";
const settings = { dummy: { kind:"boolean" as const, label:"dummy", default:false } } as const;
type S = SettingsOf<typeof settings>;
export const diceClutterPlugin: GamePlugin<DiceClutterState, DiceClutterAction, typeof settings> = {
  id:"dice-clutter", title:"Dice Clutter", category:"dice",
  players:{ min:1, max:1, multiplayer:false },
  description:"Cluttered roll of 8 dice: best 3 sum scores.",
  howToPlay:"Dice Clutter rolls 8 six-sided dice each round across 8 rounds. Your score for the round is the sum of the top 3 highest-pip dice. Maximum per round is 18 (three 6s); minimum is 3 (three 1s). Expected average is about 14-15 per round, giving you a typical session score of 110-125 points across 8 rounds.\n\nPress Roll 8 to clutter the table with dice. The top 3 are summed automatically: you do not need to pick them. Press Next to advance.\n\nStatistically, getting 18 (three sixes among 8 dice) happens often: about 21 percent of rolls produce three or more 6s. Conversely, getting only 3 (three 1s among 8 dice) is essentially impossible: even three 1s plus five non-1s requires extreme bad luck. So the game tends to land in the 12-18 range per round, making consistent 100+ scores routine.\n\nThere is no skill, just variance. Roll the clutter, watch the top three, and rack up your total!",
  settings,
  initialState:(seed:number,s:S)=>initialState(seed,s as DiceClutterSettings),
  reducer,isTerminal,component:DiceClutterGame,
};
