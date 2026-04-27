import type { GamePlugin } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { Dice21State, Dice21Action, Dice21Settings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { Dice21Game } from "./Game.js";
const settings = { dummy: { kind:"boolean" as const, label:"dummy", default:false } } as const;
type S = SettingsOf<typeof settings>;
export const dice21Plugin: GamePlugin<Dice21State, Dice21Action, typeof settings> = {
  id:"dice-21", title:"Dice 21", category:"dice",
  players:{ min:1, max:1, multiplayer:false },
  description:"Sum dice rolls toward 21 without busting; 5 rounds.",
  howToPlay:`Dice 21 is blackjack played with dice. Each round, you Hit to roll a single d6 and add to your running sum. Keep rolling, or Stand to lock in your current total. Get as close to 21 as possible without going over — go past 21 and you BUST, scoring zero for the round. Land exactly on 21 for a 50-point bonus.

There are 5 rounds. Strategy is everything: when your sum is low (say 14 or under), the odds favor another hit; at 16 you're starting to flirt with disaster; at 17+ you should usually stand and lock in points. The math: from a sum of 16, the chance of busting on the next roll is 33% (rolling 6); from 17 it's 50%; from 20 it's 100% (any non-1 busts).

Five strong rounds with no busts will land you in the 80-95 range. A perfect 21 in any round adds a juicy 71-point haul. Hit those dice — but know when to stand!`,
  settings,
  initialState:(seed:number,s:S)=>initialState(seed,s as Dice21Settings),
  reducer,isTerminal,component:Dice21Game,
};
