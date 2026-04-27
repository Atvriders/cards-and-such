import type { GamePlugin } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { FarkleMiniState, FarkleMiniAction, FarkleMiniSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { FarkleMiniGame } from "./Game.js";
const settings = { dummy: { kind:"boolean" as const, label:"dummy", default:false } } as const;
type S = SettingsOf<typeof settings>;
export const farkleMiniPlugin: GamePlugin<FarkleMiniState, FarkleMiniAction, typeof settings> = {
  id:"farkle-mini", title:"Farkle Mini", category:"dice",
  players:{ min:1, max:1, multiplayer:false },
  description:"Roll 6 dice; score 1s and 5s; bank or risk for more. 8 rounds.",
  howToPlay:`Farkle Mini is a press-your-luck dice game distilled to its essentials. Each round you roll 6 dice. Every 1 you roll is worth 100 points, and every 5 is worth 50 — those are your scoring dice (highlighted in gold). The non-scoring dice (2s, 3s, 4s, 6s) sit aside.

After each roll, you decide: bank your round and lock in the points, or roll the remaining non-scoring dice for a chance at more. If a re-roll yields ZERO ones or fives, you "Farkle" — your entire round bank is wiped out. If you score every die, you get hot dice and start over with a fresh six.

You have 8 rounds. The optimal stopping point is the classic Farkle dilemma: every re-roll multiplies risk against reward. Bank early for safety, push hard for glory. A typical run lands between 800 and 1500 points, with daring strategies climbing higher (or busting hard). Roll on!`,
  settings,
  initialState:(seed:number,s:S)=>initialState(seed,s as FarkleMiniSettings),
  reducer,isTerminal,component:FarkleMiniGame,
};
