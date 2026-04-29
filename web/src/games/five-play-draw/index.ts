import type { GamePlugin } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { FivePlayDrawState, FivePlayDrawAction, FivePlayDrawSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { FivePlayDrawGame } from "./Game.js";
const settings = { dummy: { kind:"boolean" as const, label:"dummy", default:false } } as const;
type S = SettingsOf<typeof settings>;
export const fivePlayDrawPlugin: GamePlugin<FivePlayDrawState, FivePlayDrawAction, typeof settings> = {
  id:"five-play-draw", title:"Five Play Draw Solo", category:"cards",
  players:{ min:1, max:1, multiplayer:false },
  description:"Solo five-play video poker; five simultaneous hands per draw.",
  howToPlay:"Five Play Draw Poker Solo simulates the VP format where five simultaneous draw hands play from the same initial five-card deal. Press Deal each round to receive five cards; the engine scores five independent draws.\n\nEach draw scored Jacks-or-Better: Pair (jacks+) 5, Two Pair 10, Three of a Kind 15, Straight 20, Flush 30, Full House 45, Four of a Kind 125, Straight Flush 250, Royal Flush 800. Five lines per round; eight rounds total.\n\nFive Play tightens variance compared to Triple Play: you win five times on a hit but also lose five times on a miss. Strategy stays Jacks-or-Better, but the bankroll requirements rise five-fold. Here every round multiplies by five draws. Press Next to chase Five Play jackpots — and pray for a royal!",
  settings,
  initialState:(seed:number,s:S)=>initialState(seed,s as FivePlayDrawSettings),
  reducer,isTerminal,component:FivePlayDrawGame,
};
