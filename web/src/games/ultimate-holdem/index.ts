import type { GamePlugin } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { UltimateHoldemState, UltimateHoldemAction, UltimateHoldemSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { UltimateHoldemGame } from "./Game.js";
const settings = { dummy: { kind:"boolean" as const, label:"dummy", default:false } } as const;
type S = SettingsOf<typeof settings>;
export const ultimateHoldemPlugin: GamePlugin<UltimateHoldemState, UltimateHoldemAction, typeof settings> = {
  id:"ultimate-holdem", title:"Ultimate Texas Hold'em", category:"cards",
  players:{ min:1, max:1, multiplayer:false },
  description:"Solo Ultimate Hold'em: casino Hold'em variant. Deal seven cards (hole + board) and score the best five-card hand.",
  howToPlay:"Ultimate Texas Hold'em is a casino table game where players make blind and play bets against the dealer's hand, choosing when to commit chips as community cards are revealed. The poker structure remains the same as Texas Hold'em — two hole cards plus five community cards, best five-card hand wins. This solo trainer focuses on the seven-card deal and the hand-strength scoring.\n\nPress Deal each round to receive seven random cards from a fresh 52-card deck. The reducer evaluates every five-card subset and surfaces the strongest poker hand. Values: High Card 0, Pair 10, Two Pair 30, Three of a Kind 50, Straight 70, Flush 80, Full House 100, Four of a Kind 150, Straight Flush 200.\n\nThere are eight independent rounds. With seven cards in the pool, expect frequent two-pair and trips alongside the occasional straight or flush. Press Next between rounds and try to pile up the highest cumulative score across the full eight-round Ultimate Hold'em session.",
  settings,
  initialState:(seed:number,s:S)=>initialState(seed,s as UltimateHoldemSettings),
  reducer,isTerminal,component:UltimateHoldemGame,
};
