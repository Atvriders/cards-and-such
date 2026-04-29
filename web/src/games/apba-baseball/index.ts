import type { GamePlugin } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { ApbaBaseballState, ApbaBaseballAction, ApbaBaseballSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { ApbaBaseballGame } from "./Game.js";
const settings = { dummy: { kind:"boolean" as const, label:"dummy", default:false } } as const;
type S = SettingsOf<typeof settings>;
export const apbaBaseballPlugin: GamePlugin<ApbaBaseballState, ApbaBaseballAction, typeof settings> = {
  id:"apba-baseball", title:"APBA Baseball Sim", category:"dice",
  players:{ min:1, max:1, multiplayer:false },
  description:"APBA dice-and-card baseball: 9 innings, 2 dice per at-bat.",
  howToPlay:"APBA Baseball Sim distills the APBA Game Company's dice-and-card baseball simulator into a quick 9-inning dice game. Each at-bat you roll two dice; the sum (2-12) represents the result — 12 is a home run, 2 is a strikeout. Add up totals across all 9 innings for your final score. APBA Baseball was founded in 1951 by John Stevens Jr., predating Strat-O-Matic by a decade and inventing the entire sports-sim genre. Each player gets a card with grades (A-G) reflecting real ability. APBA's real card-and-dice resolution is more granular than this mini — it uses 2d6 and looks up matrix outcomes — but the spirit of probabilistic simulation is preserved. Expected per-inning average 7, total 63 across 9 innings. Hot streaks push 90; cold ones slip to 40. Press Roll for each at-bat, Next to move on. Quick fix for the APBA-baseball-card itch.",
  settings,
  initialState:(seed:number,s:S)=>initialState(seed,s as ApbaBaseballSettings),
  reducer,isTerminal,component:ApbaBaseballGame,
};
