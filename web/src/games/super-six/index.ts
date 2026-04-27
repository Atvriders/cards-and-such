import type { GamePlugin } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { SuperSixState, SuperSixAction, SuperSixSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { SuperSixGame } from "./Game.js";
const settings = { dummy: { kind:"boolean" as const, label:"dummy", default:false } } as const;
type S = SettingsOf<typeof settings>;
export const superSixPlugin: GamePlugin<SuperSixState, SuperSixAction, typeof settings> = {
  id:"super-six", title:"Super Six", category:"dice",
  players:{ min:1, max:1, multiplayer:false },
  description:"Roll 3 dice; +30 per six. Beware: triple 1s wipes your entire score!",
  howToPlay:`Super Six is a simple-but-tense dice mini with a twist. Each round, you roll three six-sided dice. For each six in the roll, you score 30 points (so 1 six = +30, 2 sixes = +60, 3 sixes = +90). Most rolls give zero or 30.

But beware: if all three dice come up 1s (triple aces), your entire accumulated score for the game is wiped to zero.

You play 10 rounds. Triple 1s have a 1 in 216 (~0.5%) chance per roll, so over 10 rounds you have about a 4.5% chance of getting wiped at least once. Each individual six has a 1/6 chance, so on average each round nets 1.5 points × 10 rounds × 30 = roughly 45 points before risk.

Pure luck — no strategy. Roll, watch for sixes, and hope those three 1s never align. Average expected scores hover around 60-90 points; lucky games push 150+ if multi-six rolls land. Hit a wipe and… well, you start over!`,
  settings,
  initialState:(seed:number,s:S)=>initialState(seed,s as SuperSixSettings),
  reducer,isTerminal,component:SuperSixGame,
};
