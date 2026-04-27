import type { GamePlugin } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { DiceBlackjackState, DiceBlackjackAction, DiceBlackjackSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { DiceBlackjackGame } from "./Game.js";
const settings = { dummy: { kind:"boolean" as const, label:"dummy", default:false } } as const;
type S = SettingsOf<typeof settings>;
export const diceBlackjackPlugin: GamePlugin<DiceBlackjackState, DiceBlackjackAction, typeof settings> = {
  id:"dice-blackjack", title:"Dice Blackjack", category:"dice",
  players:{ min:1, max:1, multiplayer:false },
  description:"Roll dice toward 21 without busting. Stand to lock in points; eight rounds.",
  howToPlay:`Dice Blackjack is a single-die take on the classic 21 game. Each round, your goal is to build a total as close to 21 as possible without exceeding it. You start at zero. On your turn, choose Roll to add the next single die (1-6) to your total, or Stand to lock in your current total as your round score.

If you bust (your total exceeds 21), the round scores zero. If you hit exactly 21, you earn 21 plus a 10-point bonus for a total of 31. Otherwise, your standing total is your round score.

There are 8 rounds. Optimal play is something like: stand around 16-17 (when one more die would bust you more than half the time), and push for 18-21 when you have room. The maximum theoretical score is 248 (eight rounds at 31 each), but realistic averages are 100-130 if you play with good discipline.

Roll wisely, stand wisely, and don't get greedy.`,
  settings,
  initialState:(seed:number,s:S)=>initialState(seed,s as DiceBlackjackSettings),
  reducer,isTerminal,component:DiceBlackjackGame,
};
