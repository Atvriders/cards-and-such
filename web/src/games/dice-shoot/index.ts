import type { GamePlugin } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { DiceShootState, DiceShootAction, DiceShootSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { DiceShootGame } from "./Game.js";
const settings = { dummy: { kind:"boolean" as const, label:"dummy", default:false } } as const;
type S = SettingsOf<typeof settings>;
export const diceShootPlugin: GamePlugin<DiceShootState, DiceShootAction, typeof settings> = {
  id:"dice-shoot", title:"Dice Shoot", category:"dice",
  players:{ min:1, max:1, multiplayer:false },
  description:"Roll a die — hit the target shown at the start of each round. 8 rounds.",
  howToPlay:"Dice Shoot is a fast aim-the-die minigame. At the start of each of the 8 rounds, a target number from 1 to 6 is randomly chosen and shown on screen. Your job is to roll the die and try to land on that number.\n\nPress Set Target to lock the round's target, then press Roll to fire. If your roll matches the target, you score 30 points; misses score zero. Each round target is independent and uniformly random, so the per-round chance is 1 in 6 — expect 0-2 hits per game on average, with very lucky runs landing 4 or more.\n\nThe game shows your last roll and the target side-by-side so you can see your hit-or-miss. Press Next to advance to the next round and pick up a new target.\n\nTake aim, hold steady, and squeeze that virtual trigger eight times!",
  settings,
  initialState:(seed:number,s:S)=>initialState(seed,s as DiceShootSettings),
  reducer,isTerminal,component:DiceShootGame,
};
