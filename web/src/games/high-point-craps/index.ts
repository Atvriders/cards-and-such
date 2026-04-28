import type { GamePlugin } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { HighPointCrapsState, HighPointCrapsAction, HighPointCrapsSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { HighPointCrapsGame } from "./Game.js";
const settings = { dummy: { kind:"boolean" as const, label:"dummy", default:false } } as const;
type S = SettingsOf<typeof settings>;
export const highPointCrapsPlugin: GamePlugin<HighPointCrapsState, HighPointCrapsAction, typeof settings> = {
  id:"high-point-craps", title:"High Point Craps", category:"dice",
  players:{ min:1, max:1, multiplayer:false },
  description:"Simplified casino craps. 10 rounds; high sums score top.",
  howToPlay:"High Point Craps is a simplified casino craps variant where the highest come-out rolls are most valuable. Rather than the complex pass-line/come-out/point system, you simply roll two dice and score based on the sum's \"height.\"\n\nIn this 10-round version, you roll two dice each round. Scoring: 12 = 50 (highest), 11 = 40, 10 = 30, 9 = 25, 8 = 20, 7 = 15, 6 = 10, 5 = 8, 4 = 5, 3 = 3, 2 = 1.\n\n10 rounds total. The probability distribution naturally rewards 7 (most common at 16.7%) but caps it at 15 points; high rolls (10-12) are rarer (8%, 5.5%, 2.8%) but pay far more. Average expected score: 130-200 points.\n\nA streamlined casino dice experience that ditches the complexity of pass-line betting in favor of pure sum-based scoring. Roll for the boxcars (12)!",
  settings,
  initialState:(seed:number,s:S)=>initialState(seed,s as HighPointCrapsSettings),
  reducer,isTerminal,component:HighPointCrapsGame,
};
