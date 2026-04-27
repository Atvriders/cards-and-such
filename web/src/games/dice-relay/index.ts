import type { GamePlugin } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { DiceRelayState, DiceRelayAction, DiceRelaySettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { DiceRelayGame } from "./Game.js";
const settings = { dummy: { kind:"boolean" as const, label:"dummy", default:false } } as const;
type S = SettingsOf<typeof settings>;
export const diceRelayPlugin: GamePlugin<DiceRelayState, DiceRelayAction, typeof settings> = {
  id:"dice-relay", title:"Dice Relay", category:"dice",
  players:{ min:1, max:1, multiplayer:false },
  description:"4-stage relay: increasing target sums (3, 5, 7, 9). 6 rounds. +10 per cleared stage.",
  howToPlay:`Dice Relay is a press-your-luck stage-clearing game across 6 rounds. Each round has 4 stages with progressively tougher targets: stage 1 needs a sum of 3 or more, stage 2 needs 5+, stage 3 needs 7+, and the final stage 4 demands 9+. You roll two six-sided dice each stage; clear the target and you advance with +10 points; fail and the round ends with whatever stages you've banked.

A clean run through all 4 stages scores 40 points per round. Across 6 rounds, the maximum score is 240 — but stage 4 (sum ≥ 9) only succeeds about 28% of the time, so a perfect round is rare. Expected scores cluster around 100-130 points.

Tap Roll to roll the dice. After each result, press Continue: clear stages advance you up the relay; failures restart the relay for the next round. The escalating difficulty creates rich pacing — easy momentum at first, real tension by stage 3 or 4.

Roll, advance, and chase the relay!`,
  settings,
  initialState:(seed:number,s:S)=>initialState(seed,s as DiceRelaySettings),
  reducer,isTerminal,component:DiceRelayGame,
};
