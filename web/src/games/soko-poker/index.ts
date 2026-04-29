import type { GamePlugin } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { SokoPokerState, SokoPokerAction, SokoPokerSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { SokoPokerGame } from "./Game.js";
const settings = { dummy: { kind:"boolean" as const, label:"dummy", default:false } } as const;
type S = SettingsOf<typeof settings>;
export const sokoPokerPlugin: GamePlugin<SokoPokerState, SokoPokerAction, typeof settings> = {
  id:"soko-poker", title:"Soko (Canadian Stud)", category:"cards",
  players:{ min:1, max:1, multiplayer:false },
  description:"Solo Soko: 5-Card Stud variant where four-card flushes and four-card straights count as paying hands. Deal five cards.",
  howToPlay:"Soko (also called Canadian Stud) is a 5-Card Stud variant that adds two new paying hands: a four-card straight and a four-card flush, both ranked between a pair and two pair. This expanded hand chart makes weaker holdings feel meaningful. This solo trainer uses the standard 5-card poker ranking — no Soko-specific four-card hands — so you can practice the deal-and-score loop.\n\nPress Deal each round to receive five random cards from a fresh 52-card deck. Hand values: High Card 0, Pair 10, Two Pair 30, Three of a Kind 50, Straight 70, Flush 80, Full House 100, Four of a Kind 150, Straight Flush 200.\n\nThere are ten independent rounds. Whenever you see four cards of the same suit or four in sequence with one mismatch, give yourself a mental high-five — in real Soko those would have been paying hands. Press Next between rounds and chase the strongest cumulative score across the full Soko session.",
  settings,
  initialState:(seed:number,s:S)=>initialState(seed,s as SokoPokerSettings),
  reducer,isTerminal,component:SokoPokerGame,
};
