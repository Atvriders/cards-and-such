import type { GamePlugin } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { StratHockeyState, StratHockeyAction, StratHockeySettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { StratHockeyGame } from "./Game.js";
const settings = { dummy: { kind:"boolean" as const, label:"dummy", default:false } } as const;
type S = SettingsOf<typeof settings>;
export const stratHockeyPlugin: GamePlugin<StratHockeyState, StratHockeyAction, typeof settings> = {
  id:"strat-hockey", title:"Strat Hockey Sim", category:"dice",
  players:{ min:1, max:1, multiplayer:false },
  description:"Strat-O-Matic hockey: 12 shots, 2 dice per shot.",
  howToPlay:"Strat Hockey Sim distills the Strat-O-Matic hockey card-and-dice simulator into a quick 12-shot dice game. Each shot you roll two dice; the sum (2-12) represents the shot quality — 12 is a goal celebrator, 2 is an easy save. Add up totals across all 12 shots for your final score. Strat-O-Matic Hockey debuted in 1980 and resolves shots using shooter cards, goalie cards, and dice rolls calibrated to real NHL save percentages and shooting percentages. Stat-heads have used it to replay every season since the 1960s for retroactive comparisons. Real-life Strat hockey resolves zone entries, faceoffs, and line changes; this digital mini just adds dice. Expected per-shot 7, total 84 across 12 shots. Hot streaks push 110; cold ones slip to 60. Press Roll for each shot, Next to move on. Quick fix for the Strat-hockey itch between real seasons.",
  settings,
  initialState:(seed:number,s:S)=>initialState(seed,s as StratHockeySettings),
  reducer,isTerminal,component:StratHockeyGame,
};
