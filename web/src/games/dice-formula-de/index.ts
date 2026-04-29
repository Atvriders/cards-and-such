import type { GamePlugin } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { DiceFormulaDeState, DiceFormulaDeAction, DiceFormulaDeSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { DiceFormulaDeGame } from "./Game.js";
const settings = { dummy: { kind:"boolean" as const, label:"dummy", default:false } } as const;
type S = SettingsOf<typeof settings>;
export const diceFormulaDePlugin: GamePlugin<DiceFormulaDeState, DiceFormulaDeAction, typeof settings> = {
  id:"dice-formula-de", title:"Formula De Dice", category:"dice",
  players:{ min:1, max:1, multiplayer:false },
  description:"Formula De gear-shifting circuit racing: 10 corners, 2 dice per corner.",
  howToPlay:"Formula De Dice distills the iconic Formula De/Formula D circuit-racing board game into a quick 10-corner dice race. Each corner you roll two dice; the sum (2-12) represents your speed through that corner — high rolls hit the apex perfectly for big points, low rolls force you to brake hard. Add up totals across all 10 corners for your final score. Formula De was published in 1991 by Eurogames; Asmodee revived it as Formula D in 2008 with new circuits and car upgrade cards. Each player chooses gears (1-6) and rolls the corresponding die — Formula D's signature mechanic. Real Formula D is granular gear-shifting; this digital mini abstracts it as 2d6. Expected per-corner average 7, total 70 across 10 corners. Hot streaks push 100; cold ones slip to 50. Press Roll, Next. Quick fix for racing-game fans between real circuit replays.",
  settings,
  initialState:(seed:number,s:S)=>initialState(seed,s as DiceFormulaDeSettings),
  reducer,isTerminal,component:DiceFormulaDeGame,
};
