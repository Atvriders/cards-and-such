import type { GamePlugin } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { TripleTroubleState, TripleTroubleAction, TripleTroubleSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { TripleTroubleGame } from "./Game.js";
const settings = { dummy: { kind:"boolean" as const, label:"dummy", default:false } } as const;
type S = SettingsOf<typeof settings>;
export const tripleTroublePlugin: GamePlugin<TripleTroubleState, TripleTroubleAction, typeof settings> = {
  id:"triple-trouble", title:"Triple Trouble", category:"cards",
  players:{ min:1, max:1, multiplayer:false },
  description:"Draw 12 cards. Score 30 points each time you complete three of a kind.",
  howToPlay:`Triple Trouble is a luck-based card collection game. You draw cards one at a time from a shuffled deck. Each card lands in your collection (which you can see at the bottom of the screen), and the game tracks how many of each rank you've seen.

Whenever you complete three-of-a-kind — three Kings, three 7s, three Aces, anything that matches — you score 30 points. You only score on the third copy; subsequent copies of the same rank don't add anything.

You get 12 draws total. Since there are only 4 of each rank in a deck, the maximum theoretical triples is 4 (which would require 12 hits across just 4 ranks — extremely unlikely). A typical run lands 0-2 triples; lucky runs hit 3.

There's no skill, just rhythm and reveal. Draw, watch the rank counts climb, and cheer when a triple completes. Your final score is your triple count times 30.`,
  settings,
  initialState:(seed:number,s:S)=>initialState(seed,s as TripleTroubleSettings),
  reducer,isTerminal,component:TripleTroubleGame,
};
