import type { GamePlugin, HintTarget } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { FlopPokerCasState, FlopPokerCasAction, FlopPokerCasSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { FlopPokerCasGame } from "./Game.js";
const settings = { dummy: { kind:"boolean" as const, label:"dummy", default:false } } as const;
type S = SettingsOf<typeof settings>;
const hint = (state: FlopPokerCasState): HintTarget | null => (state.phase === "deal" ? { selector: '[data-testid="hint-target-flop-poker-cas-primary"]', pulses: 3 } : null);
export const flopPokerCasPlugin: GamePlugin<FlopPokerCasState, FlopPokerCasAction, typeof settings> = {
  id:"flop-poker-cas", title:"Flop Poker Casino Solo", category:"cards",
  players:{ min:1, max:1, multiplayer:false },
  description:"Solo casino Flop Poker; three-card flop determines winner.",
  howToPlay:"Flop Poker Casino Solo simulates the casino table game where players make a five-card hand against the dealer using a three-card flop. Press Deal each round to receive five cards and the engine grades the best five-card poker hand.\n\nHand values: High Card 0, Pair 10, Two Pair 30, Three of a Kind 50, Straight 70, Flush 80, Full House 100, Four of a Kind 150, Straight Flush 200. Nine rounds — nine casino sessions.\n\nLive Flop Poker is a quick casino game: dealer reveals a three-card flop, players combine with their two hole cards. Side bets reward bonus hands like trips and straights. Here each deal samples five cards directly. Press Next to chase casino-style payouts across nine rounds!",
  settings,
  initialState:(seed:number,s:S)=>initialState(seed,s as FlopPokerCasSettings),
  reducer,isTerminal,hint, component: FlopPokerCasGame,
};
