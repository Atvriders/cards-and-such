import type { GamePlugin } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { StratBaseballState, StratBaseballAction, StratBaseballSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { StratBaseballGame } from "./Game.js";
const settings = { dummy: { kind:"boolean" as const, label:"dummy", default:false } } as const;
type S = SettingsOf<typeof settings>;
export const stratBaseballPlugin: GamePlugin<StratBaseballState, StratBaseballAction, typeof settings> = {
  id:"strat-baseball", title:"Strat Baseball Sim", category:"dice",
  players:{ min:1, max:1, multiplayer:false },
  description:"Strat-O-Matic-style baseball: 9 innings, 3 dice per at-bat.",
  howToPlay:"Strat Baseball Sim distills the classic Strat-O-Matic baseball card-and-dice simulation into a quick 9-inning dice game. Each inning you roll three six-sided dice; the sum (3-18) represents the at-bat outcome — high rolls are extra-base hits and runs scored, low rolls are easy outs. Add up totals across nine innings for your final score. Strat-O-Matic Baseball is the most successful sports simulator ever, founded in 1961 by Hal Richman and used by stat-heads, fantasy leagues, and ballplayers alike to replay seasons accurately. Real-life Strat uses player cards, columns, and split dice resolution; this digital mini just multiplies dice. Average expected runs land near 90 over 9 innings. Hot dice push 110+; cold dice slip to 70. Press Roll to swing, Next to move to the next inning. Quick fix for a baseball-card-and-dice itch when you're between real Strat seasons or fantasy drafts.",
  settings,
  initialState:(seed:number,s:S)=>initialState(seed,s as StratBaseballSettings),
  reducer,isTerminal,component:StratBaseballGame,
};
