import type { GamePlugin } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { ReplayBaseballState, ReplayBaseballAction, ReplayBaseballSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { ReplayBaseballGame } from "./Game.js";
const settings = { dummy: { kind:"boolean" as const, label:"dummy", default:false } } as const;
type S = SettingsOf<typeof settings>;
export const replayBaseballPlugin: GamePlugin<ReplayBaseballState, ReplayBaseballAction, typeof settings> = {
  id:"replay-baseball", title:"Replay Baseball Sim", category:"dice",
  players:{ min:1, max:1, multiplayer:false },
  description:"Replay Baseball stat-driven sim: 9 innings, 3 dice per at-bat.",
  howToPlay:"Replay Baseball Sim distills the ultra-detailed Replay Baseball card-and-dice simulator into a quick 9-inning dice game. Each at-bat you roll three dice; the sum (3-18) represents the result — high rolls are extra-base hits and runs, low rolls are weak outs. Add up totals across all 9 innings for your final score. Replay Baseball is famous for being even more stat-detailed than Strat-O-Matic — it tracks split stats, situational hitting, ballpark adjustments, and pitcher vs batter handedness in unprecedented detail. Stat-heads use it to replay specific historical games or seasons with maximum fidelity. Replay's real card-and-dice resolution is much more granular than this mini, but the spirit of probabilistic simulation is preserved. Expected per-inning average 10.5, total 95 across 9 innings. Hot streaks push 130+; cold ones slip to 60. Press Roll, Next. A great quick fix.",
  settings,
  initialState:(seed:number,s:S)=>initialState(seed,s as ReplayBaseballSettings),
  reducer,isTerminal,component:ReplayBaseballGame,
};
