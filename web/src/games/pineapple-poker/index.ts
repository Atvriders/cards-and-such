import type { GamePlugin } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { PineapplePokerState, PineapplePokerAction, PineapplePokerSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { PineapplePokerGame } from "./Game.js";
const settings = { dummy: { kind:"boolean" as const, label:"dummy", default:false } } as const;
type S = SettingsOf<typeof settings>;
export const pineapplePokerPlugin: GamePlugin<PineapplePokerState, PineapplePokerAction, typeof settings> = {
  id:"pineapple-poker", title:"Pineapple Solo", category:"cards",
  players:{ min:1, max:1, multiplayer:false },
  description:"Solo Pineapple: deal seven cards (three hole + four community), best five-card hand scored.",
  howToPlay:"Pineapple Solo brings the cheeky Hold'em variant to a solo seeded deal. In real Pineapple, you receive THREE hole cards and discard one before the flop, then play four community cards. Press Deal each round to receive seven random cards (three hole + four board); the best five-card poker hand is scored.\n\nHand values: High Card 0, Pair 10, Two Pair 30, Three of a Kind 50, Straight 70, Flush 80, Full House 100, Four of a Kind 150, Straight Flush 200.\n\nThe discard rule in live Pineapple makes premium starting hands more frequent than vanilla Hold'em. Here the seven-card pool reflects the fact that you've effectively pre-selected your best two hole cards.\n\nEight rounds. Expect averages noticeably higher than five-card games. Press Next after each scored round and chase that rare Straight Flush.",
  settings,
  initialState:(seed:number,s:S)=>initialState(seed,s as PineapplePokerSettings),
  reducer,isTerminal,component:PineapplePokerGame,
};
