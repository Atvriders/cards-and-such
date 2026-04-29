import type { GamePlugin } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { PursuePennantState, PursuePennantAction, PursuePennantSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { PursuePennantGame } from "./Game.js";
const settings = { dummy: { kind:"boolean" as const, label:"dummy", default:false } } as const;
type S = SettingsOf<typeof settings>;
export const pursuePennantPlugin: GamePlugin<PursuePennantState, PursuePennantAction, typeof settings> = {
  id:"pursue-pennant", title:"Pursue the Pennant", category:"dice",
  players:{ min:1, max:1, multiplayer:false },
  description:"Pursue the Pennant baseball sim: 9 innings, 3 dice per at-bat.",
  howToPlay:"Pursue the Pennant distills the advanced baseball-sim of the same name into a quick 9-inning dice game. Each at-bat you roll three dice; the sum (3-18) represents the result — high rolls are extra-base hits and runs, low rolls are easy outs. Add up totals across all 9 innings for your final score. Pursue the Pennant was a 1980s-1990s baseball card-and-dice sim with park effects and historical card sets. It competed directly with APBA, Strat-O-Matic, and Replay Baseball, carving out a niche by tracking ballpark factors that affect home-run rates, doubles, and other stats. Stat-heads in that era used it for retroactive replays. The real game is granular; this digital mini just adds dice. Expected per-inning average 10.5, total 95 across 9 innings. Hot streaks push 130; cold ones slip to 60. Press Roll, Next. Quick fix.",
  settings,
  initialState:(seed:number,s:S)=>initialState(seed,s as PursuePennantSettings),
  reducer,isTerminal,component:PursuePennantGame,
};
