import type { GamePlugin } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { MiniTenziState, MiniTenziAction, MiniTenziSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { MiniTenziGame } from "./Game.js";
const settings = { dummy: { kind:"boolean" as const, label:"dummy", default:false } } as const;
type S = SettingsOf<typeof settings>;
export const miniTenziPlugin: GamePlugin<MiniTenziState, MiniTenziAction, typeof settings> = {
  id:"mini-tenzi", title:"Mini Tenzi", category:"dice",
  players:{ min:1, max:1, multiplayer:false },
  description:"Get all 10 dice to show the same number using as few rolls as possible.",
  howToPlay:`Mini Tenzi is a fast push-your-luck dice game. You have ten six-sided dice. The target number is fixed for each round (the most common face on your initial roll). Your goal: get all ten dice showing the target number using as few rolls as possible.

Dice matching the target are auto-held (turn green). You can also manually toggle holds by tapping any die. Press Roll to reroll all unheld dice.

Scoring per round: ptsThisRound = max(5, 60 - 2*rolls). So getting all ten in 5 rolls scores 50; in 10 rolls scores 40; in 20 rolls scores the floor of 5. You're capped at 20 rolls per round.

Five rounds total. Average completion takes 8-12 rolls; lucky runs finish in 4-5. The trickier the target (rare initial face), the longer it takes. Total scores around 150-200 are typical; pushing 250+ requires great luck and tight strategy.`,
  settings,
  initialState:(seed:number,s:S)=>initialState(seed,s as MiniTenziSettings),
  reducer,isTerminal,component:MiniTenziGame,
};
