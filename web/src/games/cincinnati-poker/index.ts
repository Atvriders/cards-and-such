import type { GamePlugin } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { CincinnatiPokerState, CincinnatiPokerAction, CincinnatiPokerSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { CincinnatiPokerGame } from "./Game.js";
const settings = { dummy: { kind:"boolean" as const, label:"dummy", default:false } } as const;
type S = SettingsOf<typeof settings>;
export const cincinnatiPokerPlugin: GamePlugin<CincinnatiPokerState, CincinnatiPokerAction, typeof settings> = {
  id:"cincinnati-poker", title:"Cincinnati Poker", category:"cards",
  players:{ min:1, max:1, multiplayer:false },
  description:"Solo Cincinnati (Lamebrains): five hole cards plus five community cards. Score the best five-card poker hand from seven dealt.",
  howToPlay:"Cincinnati — sometimes called Lamebrains — is a wild home-game variant where each player receives five hole cards and five community cards are dealt in the middle, all active. The strongest five-card hand from any combination wins. This solo edition condenses the deal to seven cards (a sample of hole + board) and scores the best five.\n\nPress Deal each round to draw seven random cards from a fresh 52-card deck. The reducer evaluates every five-card subset and surfaces the strongest poker hand. Values: High Card 0, Pair 10, Two Pair 30, Trips 50, Straight 70, Flush 80, Full House 100, Four of a Kind 150, Straight Flush 200.\n\nThere are eight independent rounds. Picture the cards as a generous Cincinnati spread — even with the trim, your seven-card pool gives you frequent pair-or-better outcomes and respectable shots at flushes. Press Next between rounds and chase the strongest cumulative score across the eight-round session.",
  settings,
  initialState:(seed:number,s:S)=>initialState(seed,s as CincinnatiPokerSettings),
  reducer,isTerminal,component:CincinnatiPokerGame,
};
