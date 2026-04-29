import type { GamePlugin } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { StratFootballState, StratFootballAction, StratFootballSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { StratFootballGame } from "./Game.js";
const settings = { dummy: { kind:"boolean" as const, label:"dummy", default:false } } as const;
type S = SettingsOf<typeof settings>;
export const stratFootballPlugin: GamePlugin<StratFootballState, StratFootballAction, typeof settings> = {
  id:"strat-football", title:"Strat Football Sim", category:"dice",
  players:{ min:1, max:1, multiplayer:false },
  description:"Strat-O-Matic football: 12 drives, 2 dice per drive.",
  howToPlay:"Strat Football Sim distills the classic Strat-O-Matic football card-and-dice simulator into a quick 12-drive dice game. Each drive you roll two six-sided dice; the sum (2-12) represents the drive outcome — 12 is a long touchdown drive, 2 is a three-and-out punt. Add up totals across all 12 drives for your final score. Strat-O-Matic Football debuted in 1968 and uses play cards, defensive alignment cards, and dice rolls to resolve each play, simulating actual NFL team and player tendencies. Stat-heads and fantasy commissioners love it. Real-life Strat is granular play-by-play; this digital mini just adds dice. Expected per-drive average is 7, total 84 across 12 drives. Hot streaks push 110+; cold ones slip to 60. Press Roll for the drive, Next to move on. Five-minute fix for the Strat-football-card itch between real seasons.",
  settings,
  initialState:(seed:number,s:S)=>initialState(seed,s as StratFootballSettings),
  reducer,isTerminal,component:StratFootballGame,
};
