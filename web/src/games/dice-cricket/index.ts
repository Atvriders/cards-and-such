import type { GamePlugin } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { DiceCricketState, DiceCricketAction, DiceCricketSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { DiceCricketGame } from "./Game.js";
const settings = { dummy: { kind:"boolean" as const, label:"dummy", default:false } } as const;
type S = SettingsOf<typeof settings>;
export const diceCricketPlugin: GamePlugin<DiceCricketState, DiceCricketAction, typeof settings> = {
  id:"dice-cricket", title:"Dice Cricket", category:"dice",
  players:{ min:1, max:1, multiplayer:false },
  description:"Cricket-style dice scoring across 10 rounds.",
  howToPlay:"Dice Cricket is a 10-round dice game inspired by the cricket darts variant. Each round you roll three dice. Faces 1-5 are \"wickets\", and 6 is the bullseye.\n\nScoring works like this: rolling a 6 always scores 30 (bullseye, also closes the bullseye slot). Rolling a 1-5 that hasn't been closed yet closes that wicket and scores 10. Rolling a 1-5 that's already closed scores 5 (re-hit bonus).\n\nThe board shows your six wickets (1-5 plus bullseye); each one fills green when first closed. You can re-hit closed wickets every round for the 5-point bonus, so a fast-closing run yields better late-game scoring.\n\nAverage scores hover around 200; aggressive openers can push 300+. The game ends after 10 rounds and locks in your total. Strategy is mostly luck-driven, but watching the board fill is satisfying. Press Roll 3 Dice each round, then Next to continue.",
  settings,
  initialState:(seed:number,s:S)=>initialState(seed,s as DiceCricketSettings),
  reducer,isTerminal,component:DiceCricketGame,
};
