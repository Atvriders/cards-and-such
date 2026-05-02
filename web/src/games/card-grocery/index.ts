import type { GamePlugin } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { CardGroceryState, CardGroceryAction, CardGrocerySettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { CardGroceryGame } from "./Game.js";
const settings = { dummy: { kind:"boolean" as const, label:"dummy", default:false } } as const;
type S = SettingsOf<typeof settings>;
export const cardGroceryPlugin: GamePlugin<CardGroceryState, CardGroceryAction, typeof settings> = {
  id:"card-grocery", title:"Card Grocery", category:"cards",
  players:{ min:1, max:1, multiplayer:false },
  description:"Tiny grocery card mini — pick cards, get suits, score points.",
  howToPlay:"Card Grocery turns the playing card deck into a tiny grocery run. You'll see twelve cards, two at a time. Each round, decide whether to add a card to your basket (Take) or leave it on the shelf (Skip). Your goal is to fill your basket with as many distinct rank+suit combinations as possible — variety is the spice of grocery life.\n\nFinal scoring: 10 points per card you took, with a +20 bonus for each unique suit (spades, hearts, diamonds, clubs) represented in your basket. Cards you skip don't count, so picky shoppers get paid in bonuses but lose volume points.\n\nThere are 6 rounds in a game (12 cards in pairs). Aim for a balanced cart — taking everything piles points but rarely beats a focused, four-suit haul. Try different strategies; this is grocery, not a heist!",
  settings,
  initialState:(seed:number,s:S)=>initialState(seed,s as CardGrocerySettings),
  reducer,isTerminal,hint: (state) => isTerminal(state) ? null : ({ selector: '[data-testid="hint-target-card-grocery-primary"]', pulses: 3 }), component:CardGroceryGame,
};
