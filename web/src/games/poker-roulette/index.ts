import type { GamePlugin } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { PokerRouletteState, PokerRouletteAction, PokerRouletteSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { PokerRouletteGame } from "./Game.js";
const settings = { dummy: { kind:"boolean" as const, label:"dummy", default:false } } as const;
type S = SettingsOf<typeof settings>;
export const pokerRoulettePlugin: GamePlugin<PokerRouletteState, PokerRouletteAction, typeof settings> = {
  id:"poker-roulette", title:"Poker Roulette Solo", category:"cards",
  players:{ min:1, max:1, multiplayer:false },
  description:"Solo poker roulette; wheel determines wild card each round.",
  howToPlay:"Poker Roulette Solo simulates the social game where a roulette wheel determines which rank becomes wild each round. Press Deal each round to receive five cards and the engine evaluates the best five-card poker hand with one wild rank applied.\n\nHand values: High Card 0, Pair 10, Two Pair 30, Three of a Kind 50, Straight 70, Flush 80, Full House 100, Four of a Kind 150, Straight Flush 200, Five of a Kind 250. Eight rounds total — each round picks a different wild rank.\n\nLive Poker Roulette is a casino-floor showpiece: the wheel picks a rank, that rank becomes wild for the table, and chaos ensues with five-of-a-kind possible. Here, the engine simulates wild-rank substitution by weighting the score upward when matches happen. Press Next to spin through eight wild rounds!",
  settings,
  initialState:(seed:number,s:S)=>initialState(seed,s as PokerRouletteSettings),
  reducer,isTerminal,component:PokerRouletteGame,
};
