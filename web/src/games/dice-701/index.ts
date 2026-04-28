import type { GamePlugin } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { Dice701State, Dice701Action, Dice701Settings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { Dice701Game } from "./Game.js";
const settings = { dummy: { kind:"boolean" as const, label:"dummy", default:false } } as const;
type S = SettingsOf<typeof settings>;
export const dice701Plugin: GamePlugin<Dice701State, Dice701Action, typeof settings> = {
  id:"dice-701", title:"Dice 701 Darts", category:"dice",
  players:{ min:1, max:1, multiplayer:false },
  description:"Long-form darts, subtract from 701.",
  howToPlay:"Dice 701 is the extended-distance darts variant. You start with 701 points and three dice are rolled per round; the round total is subtracted from your remaining score. The aim is to drive your score to exactly zero across up to 50 rounds.\n\nReal 701 is rare in pub play but appears in some long-form league formats and exhibition matches. The longer score line lets less-experienced players warm up before crunch finishing time, and rewards sustained scoring rather than a single sharp leg.\n\nIn this mini your final score equals 701 minus the remainder when you finish — so a perfect zero gives the full 701, while bust finishes give less. There's no double-out rule; just keep subtracting. Press Roll to throw, Next for the next visit. The cadence is meditative — long sequences of consistent dice produce satisfyingly steady countdowns. A great fit for fans who enjoy the rhythm of sustained darts scoring rather than dramatic short games.",
  settings,
  initialState:(seed:number,s:S)=>initialState(seed,s as Dice701Settings),
  reducer,isTerminal,component:Dice701Game,
};
