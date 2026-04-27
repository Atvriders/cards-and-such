import type { GamePlugin } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { MiniBlackjackState, MiniBlackjackAction, MiniBlackjackSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { MiniBlackjackGame } from "./Game.js";
const settings = { dummy: { kind:"boolean" as const, label:"dummy", default:false } } as const;
type S = SettingsOf<typeof settings>;
export const miniBlackjackPlugin: GamePlugin<MiniBlackjackState, MiniBlackjackAction, typeof settings> = {
  id:"mini-blackjack", title:"Mini Blackjack", category:"cards",
  players:{ min:1, max:1, multiplayer:false },
  description:"Hit or stand to get as close to 21 as possible without busting. 8 rounds.",
  howToPlay:`Mini Blackjack is a stripped-down solo blackjack game with no dealer, just you and the deck. Each round, you start with two cards. Your goal is to reach a hand total as close to 21 as possible without going over.

Card values: 2-10 are face value; J/Q/K = 10; Aces = 11 unless that would bust, then 1. Tap Hit to draw another card or Stand to lock in your total. Going over 21 (busting) gives zero points for that round.

Scoring per round: hit exactly 21 for 30 points; finish at 18-20 for 20 points; finish at 14-17 for 10 points; below 14 (or bust) for 0 points.

There are eight rounds total, each independent. Don't push too greedy — busting is harsh. A run that scores 100+ points is solid; pushing past 150 takes both nerve and a friendly deck. Stand on 18+ and don't tempt fate when sitting on 16!`,
  settings,
  initialState:(seed:number,s:S)=>initialState(seed,s as MiniBlackjackSettings),
  reducer,isTerminal,component:MiniBlackjackGame,
};
