import type { GamePlugin } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { ShootoutTournamentState, ShootoutTournamentAction, ShootoutTournamentSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { ShootoutTournamentGame } from "./Game.js";
const settings = { dummy: { kind:"boolean" as const, label:"dummy", default:false } } as const;
type S = SettingsOf<typeof settings>;
export const shootoutTournamentPlugin: GamePlugin<ShootoutTournamentState, ShootoutTournamentAction, typeof settings> = {
  id:"shootout-tournament", title:"Shootout Tournament Solo", category:"cards",
  players:{ min:1, max:1, multiplayer:false },
  description:"Solo shootout poker; win each round outright to advance.",
  howToPlay:"Shootout Tournament Solo simulates the bracketed format where each table plays to a single winner before survivors regroup. Press Deal each round to receive seven cards (two hole + five board) and the engine selects the best five-card poker hand.\n\nHand values: High Card 0, Pair 10, Two Pair 30, Three of a Kind 50, Straight 70, Flush 80, Full House 100, Four of a Kind 150, Straight Flush 200. Eight rounds total — eight tables to win.\n\nLive shootouts reward heads-up grinding: you must outlast every player at your table before progressing. Late-round play is heads-up heavy. Here the score is your aggregate strength across eight independent table wins. Press Next after each round and chase a clean run through the bracket!",
  settings,
  initialState:(seed:number,s:S)=>initialState(seed,s as ShootoutTournamentSettings),
  reducer,isTerminal,component:ShootoutTournamentGame,
};
