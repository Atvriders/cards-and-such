import type { GamePlugin } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { ApbaFootballState, ApbaFootballAction, ApbaFootballSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { ApbaFootballGame } from "./Game.js";
const settings = { dummy: { kind:"boolean" as const, label:"dummy", default:false } } as const;
type S = SettingsOf<typeof settings>;
export const apbaFootballPlugin: GamePlugin<ApbaFootballState, ApbaFootballAction, typeof settings> = {
  id:"apba-football", title:"APBA Football Sim", category:"dice",
  players:{ min:1, max:1, multiplayer:false },
  description:"APBA-style football: 10 drives, 2 dice per drive.",
  howToPlay:"APBA Football Sim distills the APBA Game Company's dice-and-card football simulator into a quick 10-drive dice game. Each drive you roll two dice; the sum (2-12) represents the drive outcome — 12 is a touchdown march, 2 is a three-and-out. Add up totals across all 10 drives for your final score. APBA Football is one of the oldest tabletop football sims, predating most of its competition. Players use offensive play-call cards matched against defensive alignment cards, with dice resolving final outcomes. Stat-heads use it to replay NFL seasons retroactively. APBA's real card-and-dice resolution is more granular than this mini, but the spirit of play-by-play resolution is preserved. Expected per-drive average 7, total 70 across 10 drives. Hot streaks push 100+; cold ones slip to 50. Press Roll for each drive, Next to move on. Quick fix for the APBA-football itch.",
  settings,
  initialState:(seed:number,s:S)=>initialState(seed,s as ApbaFootballSettings),
  reducer,isTerminal,component:ApbaFootballGame,
};
