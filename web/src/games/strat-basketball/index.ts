import type { GamePlugin } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { StratBasketballState, StratBasketballAction, StratBasketballSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { StratBasketballGame } from "./Game.js";
const settings = { dummy: { kind:"boolean" as const, label:"dummy", default:false } } as const;
type S = SettingsOf<typeof settings>;
export const stratBasketballPlugin: GamePlugin<StratBasketballState, StratBasketballAction, typeof settings> = {
  id:"strat-basketball", title:"Strat Basketball Sim", category:"dice",
  players:{ min:1, max:1, multiplayer:false },
  description:"Strat-O-Matic basketball: 10 possessions, 2 dice per possession.",
  howToPlay:"Strat Basketball Sim distills the Strat-O-Matic basketball card-and-dice simulator into a quick 10-possession dice game. Each possession you roll two dice; the sum (2-12) represents the possession outcome — 12 is a transition dunk for 3+ points, 2 is a turnover. Add up totals across all 10 possessions for your final score. Strat-O-Matic Basketball debuted in 1971 and uses player cards calibrated to real NBA stats — ratings for FG, 3PT, FT, defense, rebounding — plus dice rolls to resolve each possession. Stat-heads use it to replay seasons. Real-life Strat basketball resolves shot-clock decisions and foul management; this digital mini just adds dice. Expected per-possession 7, total 70 across 10 possessions. Hot streaks push 100; cold ones slip to 50. Press Roll, then Next. Quick fix for the Strat-basketball-card itch between real fantasy seasons.",
  settings,
  initialState:(seed:number,s:S)=>initialState(seed,s as StratBasketballSettings),
  reducer,isTerminal,component:StratBasketballGame,
};
