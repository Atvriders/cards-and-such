import type { GamePlugin } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { JokerPokerVpState, JokerPokerVpAction, JokerPokerVpSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { JokerPokerVpGame } from "./Game.js";
const settings = { dummy: { kind:"boolean" as const, label:"dummy", default:false } } as const;
type S = SettingsOf<typeof settings>;
export const jokerPokerVpPlugin: GamePlugin<JokerPokerVpState, JokerPokerVpAction, typeof settings> = {
  id:"joker-poker-vp", title:"Joker Poker (VP)", category:"cards",
  players:{ min:1, max:1, multiplayer:false },
  description:"Solo Joker Poker video poker: deal five cards and score the best hand. The joker would normally be wild.",
  howToPlay:"Joker Poker is a video-poker variant where one or two jokers added to the deck act as wild cards, making strong hands much more frequent. This solo trainer uses the standard 52-card deck (no joker) but lets you experience the deal-and-score flow that defines the format.\n\nPress Deal each round to receive five random cards. Hand values: High Card 0, Pair 10, Two Pair 30, Three of a Kind 50, Straight 70, Flush 80, Full House 100, Four of a Kind 150, Straight Flush 200. In a true Joker Poker machine the joker would let you fill straights and flushes more easily; here you'll need the cards to cooperate naturally.\n\nThere are ten independent rounds. Picture the imaginary joker as your good-luck mascot — when a hand barely misses a straight, that's where the wild card would have saved you. Press Next between rounds and chase the highest cumulative score across your full ten-deal Joker Poker session.",
  settings,
  initialState:(seed:number,s:S)=>initialState(seed,s as JokerPokerVpSettings),
  reducer,isTerminal,component:JokerPokerVpGame,
};
