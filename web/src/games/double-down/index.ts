import type { GamePlugin } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { DoubleDownState, DoubleDownAction, DoubleDownSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { DoubleDownGame } from "./Game.js";
const settings = { dummy: { kind:"boolean" as const, label:"dummy", default:false } } as const;
type S = SettingsOf<typeof settings>;
export const doubleDownPlugin: GamePlugin<DoubleDownState, DoubleDownAction, typeof settings> = {
  id:"double-down", title:"Double Down", category:"dice",
  players:{ min:1, max:1, multiplayer:false },
  description:"Roll 2 dice 15 times. Doubles +30, otherwise -5. Hunt for the matches!",
  howToPlay:`Double Down rewards luck — and punishes its absence. Each round you roll two dice. If they show the same number (doubles!), you score a healthy +30 points. If they don't match, you lose 5 points.

You play 15 rounds. The chance of doubles on any roll is exactly 1 in 6, or 16.7%. Your expected score over 15 rounds is roughly zero, but the variance is huge — five doubles in a row would push you near +100, while ten dry rolls in a row would dig you to -50. The final score never goes below zero, but the running tally during play can.

After each round, press Next to continue. There's no choice — just press Roll and pray for matching pips. The game's name comes from the dice term and the steady doubling-down vibe of risking small losses for big gains. Variance is the whole game!`,
  settings,
  initialState:(seed:number,s:S)=>initialState(seed,s as DoubleDownSettings),
  reducer,isTerminal,component:DoubleDownGame,
};
