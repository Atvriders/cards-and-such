import type { GamePlugin } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { NegamcoBaseballState, NegamcoBaseballAction, NegamcoBaseballSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { NegamcoBaseballGame } from "./Game.js";
const settings = { dummy: { kind:"boolean" as const, label:"dummy", default:false } } as const;
type S = SettingsOf<typeof settings>;
export const negamcoBaseballPlugin: GamePlugin<NegamcoBaseballState, NegamcoBaseballAction, typeof settings> = {
  id:"negamco-baseball", title:"Negamco Baseball", category:"dice",
  players:{ min:1, max:1, multiplayer:false },
  description:"Negamco grid-based baseball: 9 innings, 2 dice per at-bat.",
  howToPlay:"Negamco Baseball distills the lesser-known Negamco grid-based baseball simulator into a quick 9-inning dice game. Each at-bat you roll two dice; the sum (2-12) represents the result — 12 is a home run, 2 is a strikeout. Add up totals across all 9 innings for your final score. Negamco was a niche tabletop baseball sim that used grid-based dice resolution rather than the per-card lookups of Strat-O-Matic and APBA. Each play resolved into a sector outcome based on dice. The simpler resolution made Negamco appealing for quick replay and casual stat-head play. Real Negamco is more granular than this mini, but the spirit of dice-based resolution is preserved. Expected per-inning average 7, total 63 across 9 innings. Hot streaks push 90; cold ones slip to 40. Press Roll, Next. A great quick fix between full Negamco-grid replay seasons.",
  settings,
  initialState:(seed:number,s:S)=>initialState(seed,s as NegamcoBaseballSettings),
  reducer,isTerminal,component:NegamcoBaseballGame,
};
