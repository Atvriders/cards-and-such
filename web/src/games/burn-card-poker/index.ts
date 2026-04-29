import type { GamePlugin } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { BurnCardPokerState, BurnCardPokerAction, BurnCardPokerSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { BurnCardPokerGame } from "./Game.js";
const settings = { dummy: { kind:"boolean" as const, label:"dummy", default:false } } as const;
type S = SettingsOf<typeof settings>;
export const burnCardPokerPlugin: GamePlugin<BurnCardPokerState, BurnCardPokerAction, typeof settings> = {
  id:"burn-card-poker", title:"Burn Card Poker Solo", category:"cards",
  players:{ min:1, max:1, multiplayer:false },
  description:"Solo burn-card poker; burn cards become community.",
  howToPlay:"Burn Card Poker Solo simulates the variant where exposed burn cards become additional community cards, opening unusual combination math. Press Deal each round to receive six cards and the engine grades the best five-card poker hand.\n\nHand values: High Card 0, Pair 10, Two Pair 30, Three of a Kind 50, Straight 70, Flush 80, Full House 100, Four of a Kind 150, Straight Flush 200. Nine rounds — nine burn-pile draws.\n\nLive Burn Card Poker turns the routine pre-flop and pre-turn burns into part of the play. The extra community cards mean richer hand combos but also messier reads. Here every round draws six cards (rather than the usual five) reflecting the extra burn pickup. Press Next to grind nine burn-card rounds!",
  settings,
  initialState:(seed:number,s:S)=>initialState(seed,s as BurnCardPokerSettings),
  reducer,isTerminal,component:BurnCardPokerGame,
};
