import type { GamePlugin } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { KuhnPokerState, KuhnPokerAction, KuhnPokerSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { KuhnPokerGame } from "./Game.js";
const settings = { dummy: { kind:"boolean" as const, label:"dummy", default:false } } as const;
type S = SettingsOf<typeof settings>;
export const kuhnPokerPlugin: GamePlugin<KuhnPokerState, KuhnPokerAction, typeof settings> = {
  id:"kuhn-poker", title:"Kuhn Poker", category:"cards",
  players:{ min:1, max:1, multiplayer:false },
  description:"Solo Kuhn Poker: minimal three-card poker game used in game theory. Deal five cards and score the best five-card hand.",
  howToPlay:"Kuhn Poker is a famous game-theory teaching tool: a minimalist poker variant played with a three-card deck (Jack, Queen, King) where each player receives one card and bets in a single round. It's been mathematically solved and is widely used in AI research. This solo trainer scales up to a friendlier five-card poker experience — deal five cards from a standard deck and score the best hand.\n\nPress Deal each round to receive five random cards from a fresh 52-card deck. Hand values: High Card 0, Pair 10, Two Pair 30, Three of a Kind 50, Straight 70, Flush 80, Full House 100, Four of a Kind 150, Straight Flush 200.\n\nThere are ten independent rounds. The real Kuhn Poker is so simple that optimal strategy can be memorized in minutes — here the standard five-card deal gives you actual cards to react to and score. Press Next between rounds and chase the highest cumulative score across the full Kuhn-themed session.",
  settings,
  initialState:(seed:number,s:S)=>initialState(seed,s as KuhnPokerSettings),
  reducer,isTerminal,component:KuhnPokerGame,
};
