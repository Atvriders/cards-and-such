import type { GamePlugin } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { BattleYahtzeeState, BattleYahtzeeAction, BattleYahtzeeSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { BattleYahtzeeGame } from "./Game.js";
const settings = { dummy: { kind:"boolean" as const, label:"dummy", default:false } } as const;
type S = SettingsOf<typeof settings>;
export const battleYahtzeePlugin: GamePlugin<BattleYahtzeeState, BattleYahtzeeAction, typeof settings> = {
  id:"battle-yahtzee", title:"Battle Yahtzee", category:"dice",
  players:{ min:1, max:1, multiplayer:false },
  description:"Head-to-head Yahtzee scoring. 8 rounds; you roll 5 dice vs CPU.",
  howToPlay:"Battle Yahtzee pits you against a random CPU in head-to-head Yahtzee rounds. Both players roll five dice once per round, and whoever scores higher under standard Yahtzee category rules wins points for that round.\n\nEach round, the system rolls for both you and the CPU, scoring the best Yahtzee category for each (Yahtzee = 50, Four-of-a-kind = sum, Full House = 25, Small Straight = 30, Large Straight = 40, otherwise sum). The higher score earns 20 points for that round; on a tie, 10 points are split (you keep 10).\n\n8 rounds total. Average expected score: 60-120 points. Since the CPU plays the same single-roll rules with random dice, your fortunes hinge on raw luck — but the binary win-or-lose-per-round structure makes every roll feel high-stakes.\n\nFast, brutal, and a complete game in under a minute. May your dice favor you!",
  settings,
  initialState:(seed:number,s:S)=>initialState(seed,s as BattleYahtzeeSettings),
  reducer,isTerminal,component:BattleYahtzeeGame,
};
