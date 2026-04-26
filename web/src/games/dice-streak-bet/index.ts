import type { GamePlugin } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { DiceStreakBetState, DiceStreakBetAction, DiceStreakBetSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { DiceStreakBetGame } from "./Game.js";
const settings = { rounds: { kind:"enum" as const, label:"Rounds", options:["8","12"] as const, default:"8" as const } } as const;
type S = SettingsOf<typeof settings>;
export const diceStreakBetPlugin: GamePlugin<DiceStreakBetState, DiceStreakBetAction, typeof settings> = {
  id:"dice-streak-bet", title:"Dice Streak Bet", category:"dice",
  players:{ min:1, max:1, multiplayer:false },
  description:"Roll 3 dice and win if each die shows 3, 4, or 5 or higher respectively!",
  howToPlay:`Dice Streak Bet has a specific winning pattern: the lowest die must be 3 or more, the middle die must be 4 or more, and the highest die must be 5 or more. Before each roll, bet an amount from your coins. If the sorted dice hit those thresholds, you win.

This winning condition occurs less often than a coin flip, so choose bet amounts carefully. A hot streak of wins can catapult your coins; a cold run can empty your wallet fast.

Start with 100 coins. Choose 8 or 12 rounds in Settings. Your final coin total is your score.`,
  settings,
  initialState:(seed:number,s:S)=>initialState(seed,s as DiceStreakBetSettings),
  reducer,isTerminal,component:DiceStreakBetGame,
};
