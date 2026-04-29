import type { GamePlugin } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { DiceThunderPitState, DiceThunderPitAction, DiceThunderPitSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { DiceThunderPitGame } from "./Game.js";
const settings = { dummy: { kind:"boolean" as const, label:"dummy", default:false } } as const;
type S = SettingsOf<typeof settings>;
export const diceThunderPitPlugin: GamePlugin<DiceThunderPitState, DiceThunderPitAction, typeof settings> = {
  id:"dice-thunder-pit", title:"Thunder Alley Crew Chief Dice", category:"dice",
  players:{ min:1, max:1, multiplayer:false },
  description:"Thunder Alley NASCAR pit-strategy dice race: 10 laps, 2 dice per lap.",
  howToPlay:"Thunder Alley Crew Chief Dice distills the NASCAR-style Thunder Alley card game (and its Crew Chief expansion) into a quick 10-lap dice race. Each lap you roll two dice; the sum (2-12) represents your lap performance with crew-chief decisions — high rolls are perfect drafting, low rolls are pit-stop disasters. Add up totals across all 10 laps for your final score. Thunder Alley was published in 2014 by GMT Games and uses card play to simulate NASCAR drafting and team-orders strategy. The Crew Chief expansion (2017) adds pit strategy and crew-chief action cards. Real Thunder Alley is card-driven; this digital mini abstracts it as 2d6. Expected per-lap average 7, total 70 across 10 laps. Hot streaks push 100; cold ones slip to 50. Press Roll for the lap, Next. Quick fix for stock-car race-game fans.",
  settings,
  initialState:(seed:number,s:S)=>initialState(seed,s as DiceThunderPitSettings),
  reducer,isTerminal,component:DiceThunderPitGame,
};
