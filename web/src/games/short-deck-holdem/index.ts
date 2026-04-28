import type { GamePlugin } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { ShortDeckHoldemState, ShortDeckHoldemAction, ShortDeckHoldemSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { ShortDeckHoldemGame } from "./Game.js";
const settings = { dummy: { kind:"boolean" as const, label:"dummy", default:false } } as const;
type S = SettingsOf<typeof settings>;
export const shortDeckHoldemPlugin: GamePlugin<ShortDeckHoldemState, ShortDeckHoldemAction, typeof settings> = {
  id:"short-deck-holdem", title:"Short Deck Hold'em Solo", category:"cards",
  players:{ min:1, max:1, multiplayer:false },
  description:"Solo Short-Deck Hold'em: 36-card deck, seven cards dealt, best five-card high scored.",
  howToPlay:"Short Deck Hold'em Solo (also called 6+ Hold'em) uses a stripped 36-card deck — all 2s, 3s, 4s, and 5s removed. Press Deal each round to receive seven cards from this short deck (two hole + five community); the best five-card poker hand is scored.\n\nHand values: High Card 0, Pair 10, Two Pair 30, Three of a Kind 50, Straight 70, Flush 80, Full House 100, Four of a Kind 150, Straight Flush 200.\n\nIn live Short Deck, hand rankings adjust — flush beats full house, three of a kind beats straight — because flushes are rarer in a short deck. This solo uses standard rankings for simplicity but you'll naturally see more big hands due to the smaller deck.\n\nEight rounds. Expect averages well above standard Hold'em. Press Next between rounds and chase a Straight Flush!",
  settings,
  initialState:(seed:number,s:S)=>initialState(seed,s as ShortDeckHoldemSettings),
  reducer,isTerminal,component:ShortDeckHoldemGame,
};
