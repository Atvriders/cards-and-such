import type { GamePlugin } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { Dice421State, Dice421Action, Dice421Settings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { Dice421Game } from "./Game.js";
const settings = { dummy: { kind:"boolean" as const, label:"dummy", default:false } } as const;
type S = SettingsOf<typeof settings>;
export const dice421Plugin: GamePlugin<Dice421State, Dice421Action, typeof settings> = {
  id:"dice-421", title:"421", category:"dice",
  players:{ min:1, max:1, multiplayer:false },
  description:"French bar dice with special 4-2-1 combo. 10 rounds, single-roll scoring.",
  howToPlay:"421 (Quatre Cent Vingt et Un) is a French bar game where the iconic winning combo is 4-2-1 — and the sum 4+2+1 = 7 famously equals the lowest target in the system. The game has rich combo-based scoring with special legendary rolls.\n\nIn this 10-round single-roll version, you roll three dice once. The system finds the best 421 category: 4-2-1 (\"Le Four-Two-One\") = 80, 1-1-1 (\"Aces\") = 70, Trips (other 3-of-a-kind) = 60, Suite (1-2-3 or 4-5-6 or 2-3-4 etc.) = 40, 1-1-x with high x = 25 + x*5, Pair = sum × 2, otherwise sum.\n\n10 rounds total. The 4-2-1 has 6/216 probability (any order) = 1/36. A perfect run of 4-2-1s would score 800 — astronomically unlikely. Average expected score: 100-200 points.\n\nFast, French, and full of flair. Le quatre-deux-un est roi!",
  settings,
  initialState:(seed:number,s:S)=>initialState(seed,s as Dice421Settings),
  reducer,isTerminal,component:Dice421Game,
};
