import type { GamePlugin } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { StraightShotState, StraightShotAction, StraightShotSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { StraightShotGame } from "./Game.js";
const settings = { dummy: { kind:"boolean" as const, label:"dummy", default:false } } as const;
type S = SettingsOf<typeof settings>;
export const straightShotPlugin: GamePlugin<StraightShotState, StraightShotAction, typeof settings> = {
  id:"straight-shot", title:"Straight Shot", category:"dice",
  players:{ min:1, max:1, multiplayer:false },
  description:"Roll 5 dice. Score for the longest run of consecutive numbers.",
  howToPlay:`Straight Shot rolls five dice each round and scores you on the longest run of consecutive integers in the result. A 3-in-a-row (like 2-3-4) scores 25 points; a 4-in-a-row (like 1-2-3-4) scores 50; and a full 5-in-a-row (1-2-3-4-5 or 2-3-4-5-6) scores a beautiful 100 points. Anything shorter scores nothing.

Eight rounds per game. Note that duplicates within the dice don't matter — only the unique sorted values count toward the run. So a roll of 2,3,3,4,5 still counts as a 4-straight (2-3-4-5).

A 5-straight from five dice is around a 3% chance per roll, so don't expect them often. Most rounds you'll see 25 or 50 points; some yield zero. Average expected scores are around 100 to 150 over a game. Two perfect 5-straights would give you a remarkable 200+ run!`,
  settings,
  initialState:(seed:number,s:S)=>initialState(seed,s as StraightShotSettings),
  reducer,isTerminal,component:StraightShotGame,
};
