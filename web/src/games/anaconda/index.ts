import type { GamePlugin } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { AnacondaPokerState, AnacondaPokerAction, AnacondaPokerSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { AnacondaPokerGame } from "./Game.js";
const settings = { dummy: { kind:"boolean" as const, label:"dummy", default:false } } as const;
type S = SettingsOf<typeof settings>;
export const anacondaPokerPlugin: GamePlugin<AnacondaPokerState, AnacondaPokerAction, typeof settings> = {
  id:"anaconda", title:"Anaconda Poker", category:"cards",
  players:{ min:1, max:1, multiplayer:false },
  description:"Solo Anaconda: deal seven cards (mimicking the pass-three, pass-two, pass-one rounds) and score the best five-card poker hand.",
  howToPlay:"Anaconda is a wild home-game classic where players are dealt seven cards and pass three, then two, then a single card to neighbors before the showdown. This solo edition skips the social passing and just awards you the deal — but with seven full cards to choose from, the swings get spicy fast.\n\nPress Deal each round to draw seven random cards from a fresh 52-card deck. The reducer evaluates every five-card subset and returns the strongest hand: High Card 0, Pair 10, Two Pair 30, Trips 50, Straight 70, Flush 80, Full House 100, Four of a Kind 150, Straight Flush 200.\n\nYou play eight rounds, each independent. Treat the early rounds as scouting trips and the later rounds as your shot to chase a flush or boat. Because the seven-card pool is so generous, expect to stumble into pairs and two-pair regularly, and big hands more often than in a five-card draw.\n\nPress Next after each round and try to pile up the highest cumulative score across all eight deals!",
  settings,
  initialState:(seed:number,s:S)=>initialState(seed,s as AnacondaPokerSettings),
  reducer,isTerminal,component:AnacondaPokerGame,
};
