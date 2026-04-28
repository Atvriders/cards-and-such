import type { GamePlugin } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { FiveStudPokerState, FiveStudPokerAction, FiveStudPokerSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { FiveStudPokerGame } from "./Game.js";
const settings = { dummy: { kind:"boolean" as const, label:"dummy", default:false } } as const;
type S = SettingsOf<typeof settings>;
export const fiveStudPokerPlugin: GamePlugin<FiveStudPokerState, FiveStudPokerAction, typeof settings> = {
  id:"five-stud-poker", title:"5-Card Stud Solo", category:"cards",
  players:{ min:1, max:1, multiplayer:false },
  description:"Solo 5-Card Stud: five cards dealt per round, classic poker scoring.",
  howToPlay:"5-Card Stud Solo is the leanest of the stud variants. Press Deal each round and receive exactly five cards from a 52-card deck — corresponding to one down-card and four up-cards in the real game.\n\nThe five cards are scored using standard poker rankings: High Card 0, Pair 10, Two Pair 30, Three of a Kind 50, Straight 70, Flush 80, Full House 100, Four of a Kind 150, Straight Flush 200.\n\nIn the live game, betting follows each up-card reveal — you can read your opponents' visible board in real time. Here the structural reduction is purity: just one deal per round, no draws.\n\nTen rounds. Five-card stud means lower averages than seven-card games — expect many High Card and Pair results, with a Straight or better being a real treat. Press Next between rounds and grind toward a high.",
  settings,
  initialState:(seed:number,s:S)=>initialState(seed,s as FiveStudPokerSettings),
  reducer,isTerminal,component:FiveStudPokerGame,
};
