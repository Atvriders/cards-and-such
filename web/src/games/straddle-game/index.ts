import type { GamePlugin } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { StraddleGameState, StraddleGameAction, StraddleGameSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { StraddleGameGame } from "./Game.js";
const settings = { dummy: { kind:"boolean" as const, label:"dummy", default:false } } as const;
type S = SettingsOf<typeof settings>;
export const straddleGamePlugin: GamePlugin<StraddleGameState, StraddleGameAction, typeof settings> = {
  id:"straddle-game", title:"Straddle Game Solo", category:"cards",
  players:{ min:1, max:1, multiplayer:false },
  description:"Solo straddle poker; doubled blind structure simulated each round.",
  howToPlay:"Straddle Game Solo simulates cash games where a live straddle is optional or required, doubling the effective blind structure. Press Deal each round to receive seven cards (two hole + five community) and the best five-card poker hand is auto-scored.\n\nHand values: High Card 0, Pair 10, Two Pair 30, Three of a Kind 50, Straight 70, Flush 80, Full House 100, Four of a Kind 150, Straight Flush 200. Nine rounds reflect inflated straddle pots.\n\nLive straddle play creates massive pots with shorter effective stack-to-pot ratios. Hands like suited connectors lose value while premium pairs dominate because of the inflated stakes. Here every deal feels like a straddled pot — high variance, premium-driven. Press Next to navigate nine swingy straddle rounds!",
  settings,
  initialState:(seed:number,s:S)=>initialState(seed,s as StraddleGameSettings),
  reducer,isTerminal,component:StraddleGameGame,
};
