import type { GamePlugin } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { BonusPokerDeluxeState, BonusPokerDeluxeAction, BonusPokerDeluxeSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { BonusPokerDeluxeGame } from "./Game.js";
const settings = { dummy: { kind:"boolean" as const, label:"dummy", default:false } } as const;
type S = SettingsOf<typeof settings>;
export const bonusPokerDeluxePlugin: GamePlugin<BonusPokerDeluxeState, BonusPokerDeluxeAction, typeof settings> = {
  id:"bonus-poker-deluxe", title:"Bonus Poker Deluxe (VP)", category:"cards",
  players:{ min:1, max:1, multiplayer:false },
  description:"Solo Bonus Poker Deluxe: video poker variant with flat bonus for any four-of-a-kind. Deal five cards and score the best hand.",
  howToPlay:"Bonus Poker Deluxe is a video-poker paytable that pays a flat bonus for any four-of-a-kind — no kicker required, no rank restrictions. This solo trainer focuses on the deal itself: five cards from a fresh deck, scored with the standard hand-rank table that already gives quads a hefty payout.\n\nPress Deal each round to receive five random cards from a fresh 52-card deck. Hand values: High Card 0, Pair 10, Two Pair 30, Three of a Kind 50, Straight 70, Flush 80, Full House 100, Four of a Kind 150, Straight Flush 200.\n\nThere are ten independent rounds. Bonus Poker Deluxe rewards the player who chases quads aggressively — the 150-point payout already simulates that excitement. With only five cards each round you'll mostly land pairs, but the rare four-of-a-kind round can blow the doors off your cumulative score. Press Next between rounds and chase that single big hit across your full ten-deal session.",
  settings,
  initialState:(seed:number,s:S)=>initialState(seed,s as BonusPokerDeluxeSettings),
  reducer,isTerminal,component:BonusPokerDeluxeGame,
};
