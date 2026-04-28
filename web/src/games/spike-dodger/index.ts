import type { GamePlugin } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { SpikeDodgerState, SpikeDodgerAction, SpikeDodgerSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { SpikeDodgerGame } from "./Game.js";
const settings = { dummy: { kind:"boolean" as const, label:"dummy", default:false } } as const;
type S = SettingsOf<typeof settings>;
export const spikeDodgerPlugin: GamePlugin<SpikeDodgerState, SpikeDodgerAction, typeof settings> = {
  id:"spike-dodger", title:"Spike Dodger", category:"arcade",
  players:{ min:1, max:1, multiplayer:false },
  description:"Tap shields appearing in lanes to deflect spikes.",
  howToPlay:"Spike Dodger is a thirty-second one-button reflex sprint. Shields appear at random across six lanes — your job is to tap each shield before it disappears to deflect the spikes. Each successful tap is worth ten points; missed shields count against your accuracy. New shields spawn rapidly, sometimes one or two per tick, and each shield only stays visible for a few ticks before vanishing. The board ticks roughly once per second, and the timer counts down from thirty in the corner. Quick reflexes and good visual scanning are rewarded — the more shields you tap, the higher your score. Average runs land near 200-280 points; reflex specialists clear 350+. There's no penalty for tapping empty space, so feel free to attack the screen aggressively. The clock counts down to zero, then your final score is locked in. Stay sharp, stay safe — dodge those spikes!",
  settings,
  initialState:(seed:number,s:S)=>initialState(seed,s as SpikeDodgerSettings),
  reducer,isTerminal,component:SpikeDodgerGame,
};
