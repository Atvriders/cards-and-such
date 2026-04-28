import type { GamePlugin } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { CardBookshopState, CardBookshopAction, CardBookshopSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { CardBookshopGame } from "./Game.js";
const settings = { dummy: { kind:"boolean" as const, label:"dummy", default:false } } as const;
type S = SettingsOf<typeof settings>;
export const cardBookshopPlugin: GamePlugin<CardBookshopState, CardBookshopAction, typeof settings> = {
  id:"card-bookshop", title:"Card Bookshop", category:"cards",
  players:{ min:1, max:1, multiplayer:false },
  description:"Bookshop mini — populate genres with 2+ or 3+ books per suit.",
  howToPlay:"Card Bookshop is a tiny shelving mini. Twelve cards arrive two at a time, each pretending to be a book of a particular \"genre\" (its suit). Each round you decide Take (shelve it) or Skip (return it). Your goal is to build a shop with strong genre coverage and depth.\n\nFinal scoring: 5 points per kept card, +15 for each suit in which you have 2+ books (a populated genre), +30 for each suit with 3+ books (a full shelf). Strong specialization rewards you handsomely.\n\nSix rounds total (12 cards). The book-shop buyer's instinct is to skip unrelated singles and load up on whatever genre is selling — a well-stocked mystery shelf is more valuable than a smattering of one-offs!",
  settings,
  initialState:(seed:number,s:S)=>initialState(seed,s as CardBookshopSettings),
  reducer,isTerminal,component:CardBookshopGame,
};
