import type { GamePlugin } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { Dice301State, Dice301Action, Dice301Settings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { Dice301Game } from "./Game.js";
const settings = { dummy: { kind:"boolean" as const, label:"dummy", default:false } } as const;
type S = SettingsOf<typeof settings>;
export const dice301Plugin: GamePlugin<Dice301State, Dice301Action, typeof settings> = {
  id:"dice-301", title:"Dice 301 Darts", category:"dice",
  players:{ min:1, max:1, multiplayer:false },
  description:"Subtract dart scores from 301.",
  howToPlay:"Dice 301 is a darts subtraction sim. You start with 301 points and roll three dice every round; each round's total is subtracted from your remaining score. Your goal is to drive the score to exactly zero (or below). Each round one dart equals roughly 5-25 points.\n\nThe mini gives you up to 30 rounds; a normal player finishes in around 12 to 18 rounds. Your final game score equals 301 minus what you finish with, so finishing on zero gives the full 301; finishing high (over-throwing in real darts is a 'bust') gives less.\n\nReal 301 is the standard pub darts subtraction game. Unlike 501, the lower starting total means you must score sharply from the very first throw — there's no warmup. This mini doesn't enforce the double-out rule; it's purely a rolling subtraction sim. Press Roll to throw, Next to advance. Crisp, classic, and a perfect quick-fix for darts fans.",
  settings,
  initialState:(seed:number,s:S)=>initialState(seed,s as Dice301Settings),
  reducer,isTerminal,component:Dice301Game,
};
