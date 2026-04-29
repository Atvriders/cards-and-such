import type { GamePlugin } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { FiveOPokerState, FiveOPokerAction, FiveOPokerSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { FiveOPokerGame } from "./Game.js";
const settings = { dummy: { kind:"boolean" as const, label:"dummy", default:false } } as const;
type S = SettingsOf<typeof settings>;
export const fiveOPokerPlugin: GamePlugin<FiveOPokerState, FiveOPokerAction, typeof settings> = {
  id:"five-o-poker", title:"Five-O Poker Solo", category:"cards",
  players:{ min:1, max:1, multiplayer:false },
  description:"Solo Five-O; heads-up poker with five hands of five cards each.",
  howToPlay:"Five-O Poker Solo simulates the heads-up format where each player places five hands of five cards in parallel. Press Deal each round to receive five cards and the engine evaluates the best five-card poker hand from your draw.\n\nHand values: High Card 0, Pair 10, Two Pair 30, Three of a Kind 50, Straight 70, Flush 80, Full House 100, Four of a Kind 150, Straight Flush 200. Eight rounds — eight Five-O snapshots.\n\nLive Five-O is brutal: you make five hands and your opponent makes five, then they're matched up one-to-one and best-of-five wins the pot. Strategy involves balancing your strongest hand placement against opponent reads. Here every round is one snapshot of a Five-O hand. Press Next to chase a stacked aggregate!",
  settings,
  initialState:(seed:number,s:S)=>initialState(seed,s as FiveOPokerSettings),
  reducer,isTerminal,component:FiveOPokerGame,
};
