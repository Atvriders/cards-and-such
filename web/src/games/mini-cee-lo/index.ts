import type { GamePlugin } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { MiniCeeLoState, MiniCeeLoAction, MiniCeeLoSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { MiniCeeLoGame } from "./Game.js";
const settings = { dummy: { kind:"boolean" as const, label:"dummy", default:false } } as const;
type S = SettingsOf<typeof settings>;
export const miniCeeLoPlugin: GamePlugin<MiniCeeLoState, MiniCeeLoAction, typeof settings> = {
  id:"mini-cee-lo", title:"Mini Cee-lo", category:"dice",
  players:{ min:1, max:1, multiplayer:false },
  description:"Three-dice Cee-lo: 4-5-6 wins big, triples are great, pairs give a point. 10 rounds.",
  howToPlay:`Mini Cee-lo is the classic three-dice gambling game played solo. Each round you roll three dice and the result is evaluated using the standard Cee-lo precedence:

4-5-6 (any order): Instant win, 50 points. Triples (1-1-1, 2-2-2, ... 6-6-6): 30 points. Pair plus a single "point" die: the point die value × 2 (so 1-1-6 scores 12, 4-4-3 scores 6). 1-2-3: instant bust, 0 points. Anything else: 0 points (no scoring combination).

Press Roll to attempt a hand, see the result, then Next to continue.

There are ten rounds. About 28% of rolls produce a scorable result (pair + point or better), so an average run scores around 60-100 points. Lucky 4-5-6s and triples can push past 200. Long droughts are common, but one big roll changes everything. Play it cool!`,
  settings,
  initialState:(seed:number,s:S)=>initialState(seed,s as MiniCeeLoSettings),
  reducer,isTerminal,component:MiniCeeLoGame,
};
