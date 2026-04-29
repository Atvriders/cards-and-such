import type { GamePlugin } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { CrissCrossPokerState, CrissCrossPokerAction, CrissCrossPokerSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { CrissCrossPokerGame } from "./Game.js";
const settings = { dummy: { kind:"boolean" as const, label:"dummy", default:false } } as const;
type S = SettingsOf<typeof settings>;
export const crissCrossPokerPlugin: GamePlugin<CrissCrossPokerState, CrissCrossPokerAction, typeof settings> = {
  id:"criss-cross-poker", title:"Criss-Cross Poker", category:"cards",
  players:{ min:1, max:1, multiplayer:false },
  description:"Solo Criss-Cross (X-Cross): deal seven cards representing two hole cards and a five-card cross of community cards. Score the best five.",
  howToPlay:"Criss-Cross (sometimes called X-Cross) lays out five community cards in a plus-sign — a shared middle card with two arms — and players combine two hole cards with one full arm or column to make their best hand. In this solo version we deal seven random cards (your two hole cards plus the five-card cross) and the reducer picks the best five-card subset for you.\n\nPress Deal each round to draw seven cards from a fresh 52-card deck. Hand rankings: High Card 0, Pair 10, Two Pair 30, Three of a Kind 50, Straight 70, Flush 80, Full House 100, Four of a Kind 150, Straight Flush 200.\n\nYou play eight independent rounds. Picture the middle card as the universal hub and the arms as competing options; even though we don't enforce arm-or-column rules here, your seven-card pool lets you preview the kind of strong hands the Criss-Cross board can produce. Press Next after each round to chase a top cumulative score across the whole session.",
  settings,
  initialState:(seed:number,s:S)=>initialState(seed,s as CrissCrossPokerSettings),
  reducer,isTerminal,component:CrissCrossPokerGame,
};
