import type { GamePlugin } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { DiceBullseyeState, DiceBullseyeAction, DiceBullseyeSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { DiceBullseyeGame } from "./Game.js";
const settings = { dummy: { kind:"boolean" as const, label:"dummy", default:false } } as const;
type S = SettingsOf<typeof settings>;
export const diceBullseyePlugin: GamePlugin<DiceBullseyeState, DiceBullseyeAction, typeof settings> = {
  id:"dice-bullseye", title:"Dice Bullseye", category:"dice",
  players:{ min:1, max:1, multiplayer:false },
  description:"Pick a target; closer dice roll = bigger score. 8 rounds.",
  howToPlay:"Dice Bullseye is an 8-round target-rolling game. Each round, you pick a target number (3, 4, 5, or 6), then a single d6 is rolled. The closer your dice result is to your called target, the bigger the score.\n\nExact bullseye match earns 30 points, off-by-one earns 15, off-by-two earns 5, and a miss of 3+ earns zero. Picking 3 or 6 (edge targets) makes off-by-three impossible — you lose distance only on the inside spread. Picking 4 or 5 (middle) gives more bullseye chances per side but more far-misses too.\n\nTap a number to lock your target. Watch the d6 fall and check the distance scoring. Press Next to advance.\n\nA typical 8-round game scores 60-110 points; a sharp shooter can break 150. Dice Bullseye rewards reading variance and tightening your aim.",
  settings,
  initialState:(seed:number,s:S)=>initialState(seed,s as DiceBullseyeSettings),
  reducer,isTerminal,component:DiceBullseyeGame,
};
