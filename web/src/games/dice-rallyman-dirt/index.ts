import type { GamePlugin } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { DiceRallymanDirtState, DiceRallymanDirtAction, DiceRallymanDirtSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { DiceRallymanDirtGame } from "./Game.js";
const settings = { dummy: { kind:"boolean" as const, label:"dummy", default:false } } as const;
type S = SettingsOf<typeof settings>;
export const diceRallymanDirtPlugin: GamePlugin<DiceRallymanDirtState, DiceRallymanDirtAction, typeof settings> = {
  id:"dice-rallyman-dirt", title:"Rallyman DIRT Dice", category:"dice",
  players:{ min:1, max:1, multiplayer:false },
  description:"Rallyman DIRT off-road rally: 12 stages, 2 dice per stage.",
  howToPlay:"Rallyman DIRT Dice distills the off-road dirt-and-gravel Rallyman DIRT board game into a quick 12-stage dice rally. Each stage you roll two dice; the sum (2-12) represents your stage time — high rolls are clean runs, low rolls are puncture-and-spin disasters. Add up totals across all 12 stages for your final score. Rallyman DIRT was published in 2020 by Holy Grail Games, building on the success of Rallyman GT (2018). DIRT adds puncture and breakdown risk cards plus dirt-and-gravel surface effects. Each turn players manage dice-pool dice for gear, brake, throttle, and pace-note steady. Real Rallyman DIRT is granular dice-and-card play; this digital mini abstracts it as 2d6. Expected per-stage average 7, total 84 across 12 stages. Hot streaks push 110; cold slip to 60. Press Roll, Next. Quick fix.",
  settings,
  initialState:(seed:number,s:S)=>initialState(seed,s as DiceRallymanDirtSettings),
  reducer,isTerminal,component:DiceRallymanDirtGame,
};
