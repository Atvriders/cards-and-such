import type { GamePlugin } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { BombPotState, BombPotAction, BombPotSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { BombPotGame } from "./Game.js";
const settings = { dummy: { kind:"boolean" as const, label:"dummy", default:false } } as const;
type S = SettingsOf<typeof settings>;
export const bombPotPlugin: GamePlugin<BombPotState, BombPotAction, typeof settings> = {
  id:"bomb-pot", title:"Bomb Pot Solo", category:"cards",
  players:{ min:1, max:1, multiplayer:false },
  description:"Solo bomb-pot poker; preflop skipped, straight to community board.",
  howToPlay:"Bomb Pot Solo simulates the cash-game ritual where every player posts an extra blind, preflop betting is skipped, and the dealer goes straight to the flop. Press Deal each round to receive seven cards and the engine evaluates the best five-card hand.\n\nHand values: High Card 0, Pair 10, Two Pair 30, Three of a Kind 50, Straight 70, Flush 80, Full House 100, Four of a Kind 150, Straight Flush 200. Nine rounds total — nine bomb-pot setups.\n\nBomb pot strategy is unique: with no preflop fold-equity and inflated pots, weaker hands get to see boards they would normally fold. Drawing hands gain in value relative to high cards. Here each deal models a bomb-pot scenario where you see all seven cards. Press Next to play out nine inflated bomb pots and chase the high score!",
  settings,
  initialState:(seed:number,s:S)=>initialState(seed,s as BombPotSettings),
  reducer,isTerminal,component:BombPotGame,
};
