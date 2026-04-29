import type { GamePlugin } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { DiceGrandPrixF1State, DiceGrandPrixF1Action, DiceGrandPrixF1Settings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { DiceGrandPrixF1Game } from "./Game.js";
const settings = { dummy: { kind:"boolean" as const, label:"dummy", default:false } } as const;
type S = SettingsOf<typeof settings>;
export const diceGrandPrixF1Plugin: GamePlugin<DiceGrandPrixF1State, DiceGrandPrixF1Action, typeof settings> = {
  id:"dice-grand-prix-f1", title:"Grand Prix F1 Dice", category:"dice",
  players:{ min:1, max:1, multiplayer:false },
  description:"Grand Prix F1 slipstream dice race: 12 laps, 2 dice per lap.",
  howToPlay:"Grand Prix F1 Dice distills the F1-themed Grand Prix card game into a quick 12-lap dice race. Each lap you roll two dice; the sum (2-12) represents your lap performance — high rolls are slipstream-overtake wins, low rolls are pit-stop or engine failures. Add up totals across all 12 laps for your final score. Grand Prix card games have been published by various designers since the 1970s, simulating Formula One tracks across decades — Monaco, Silverstone, Monza, Suzuka, Spa-Francorchamps, etc. Each game uses unique slipstream and overtake mechanics. Real Grand Prix card games are tactical hand-management; this digital mini abstracts it as 2d6. Expected per-lap average 7, total 84 across 12 laps. Hot streaks push 110; cold slip to 60. Press Roll, Next. Quick fix for F1 fans between real Grand Prix replays.",
  settings,
  initialState:(seed:number,s:S)=>initialState(seed,s as DiceGrandPrixF1Settings),
  reducer,isTerminal,component:DiceGrandPrixF1Game,
};
