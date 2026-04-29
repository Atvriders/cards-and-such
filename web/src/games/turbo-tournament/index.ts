import type { GamePlugin } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { TurboTournamentState, TurboTournamentAction, TurboTournamentSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { TurboTournamentGame } from "./Game.js";
const settings = { dummy: { kind:"boolean" as const, label:"dummy", default:false } } as const;
type S = SettingsOf<typeof settings>;
export const turboTournamentPlugin: GamePlugin<TurboTournamentState, TurboTournamentAction, typeof settings> = {
  id:"turbo-tournament", title:"Turbo Tournament Solo", category:"cards",
  players:{ min:1, max:1, multiplayer:false },
  description:"Solo fast-blind poker; eight quick rounds simulating turbo format.",
  howToPlay:"Turbo Tournament Solo simulates the fast-blind format where blinds rise every five to ten minutes, forcing aggression and short-stack play. Press Deal each round to receive seven cards and the engine evaluates the best five-card hand from your draw.\n\nHand values: High Card 0, Pair 10, Two Pair 30, Three of a Kind 50, Straight 70, Flush 80, Full House 100, Four of a Kind 150, Straight Flush 200. Eight rounds total — each rapid like a turbo blind level.\n\nIn turbo play the math changes: stack-to-pot ratios shrink fast and shove-or-fold dominates the late stages. Here, each deal is one turbo level — quick and decisive. Premium hands carry massive scoring weight. Press Next quickly between rounds to keep the pace alive!",
  settings,
  initialState:(seed:number,s:S)=>initialState(seed,s as TurboTournamentSettings),
  reducer,isTerminal,component:TurboTournamentGame,
};
