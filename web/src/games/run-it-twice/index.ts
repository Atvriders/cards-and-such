import type { GamePlugin } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { RunItTwiceState, RunItTwiceAction, RunItTwiceSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { RunItTwiceGame } from "./Game.js";
const settings = { dummy: { kind:"boolean" as const, label:"dummy", default:false } } as const;
type S = SettingsOf<typeof settings>;
export const runItTwicePlugin: GamePlugin<RunItTwiceState, RunItTwiceAction, typeof settings> = {
  id:"run-it-twice", title:"Run It Twice Solo", category:"cards",
  players:{ min:1, max:1, multiplayer:false },
  description:"Solo run-it-twice poker; two boards simulated, scores combined.",
  howToPlay:"Run It Twice Solo simulates the cash-game tradition where all-in equity is dealt out across two separate community boards to reduce variance. Press Deal to receive seven cards and the engine evaluates the best five-card poker hand.\n\nHand values: High Card 0, Pair 10, Two Pair 30, Three of a Kind 50, Straight 70, Flush 80, Full House 100, Four of a Kind 150, Straight Flush 200. Eight rounds — each effectively two runs averaged.\n\nRun-it-twice makes the variance of all-in spots cleaner: rather than a single coinflip, you get two flips and split the pot accordingly. Equities converge over multiple runs. Here every round simulates two runs of the same hand by sampling seven cards twice. Press Next to chase a low-variance, high-skill aggregate!",
  settings,
  initialState:(seed:number,s:S)=>initialState(seed,s as RunItTwiceSettings),
  reducer,isTerminal,component:RunItTwiceGame,
};
