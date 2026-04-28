import type { GamePlugin } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { DiceVillageState, DiceVillageAction, DiceVillageSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { DiceVillageGame } from "./Game.js";
const settings = { dummy: { kind:"boolean" as const, label:"dummy", default:false } } as const;
type S = SettingsOf<typeof settings>;
export const diceVillagePlugin: GamePlugin<DiceVillageState, DiceVillageAction, typeof settings> = {
  id:"dice-village", title:"Dice Village", category:"dice",
  players:{ min:1, max:1, multiplayer:false },
  description:"Build a village with dice. Sum >= 8 scores. 10 rounds.",
  howToPlay:"Dice Village is a 10-round dice mini. Each round you roll two six-sided dice. If the sum is 8 or higher, you've successfully built another structure in your village (house, barn, mill, etc.) and score 10 points. If the sum is 7 or lower, the construction stalls for nothing.\n\nThe probability of sum >= 8 with two dice is 15/36, about 41.7%. So expected scores are around 42 points across 10 rounds.\n\nThere's no skill — just press Roll, see your dice, and watch the village grow. After each result, press Next to continue. The village theme is purely cosmetic; mechanically this is a pure dice-threshold game. The relatively low win rate keeps things tense, and a streak of high rolls feels especially rewarding when it lands. Build your village brick by brick — and let luck favor the rolling!",
  settings,
  initialState:(seed:number,s:S)=>initialState(seed,s as DiceVillageSettings),
  reducer,isTerminal,component:DiceVillageGame,
};
