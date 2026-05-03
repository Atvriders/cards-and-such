import type { GamePlugin, HintTarget } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { FreerollTournamentState, FreerollTournamentAction, FreerollTournamentSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { FreerollTournamentGame } from "./Game.js";
const settings = { dummy: { kind:"boolean" as const, label:"dummy", default:false } } as const;
type S = SettingsOf<typeof settings>;
export const freerollTournamentPlugin: GamePlugin<FreerollTournamentState, FreerollTournamentAction, typeof settings> = {
  id:"freeroll-tournament", title:"Freeroll Tournament Solo", category:"cards",
  players:{ min:1, max:1, multiplayer:false },
  description:"Solo freeroll poker; no buy-in, real prize-pool simulation.",
  howToPlay:"Freeroll Tournament Solo emulates events with no buy-in but real prizes — typically loss-leaders run by online cardrooms. Press Deal each round to receive seven cards and the engine grades the best five-card poker hand.\n\nHand values: High Card 0, Pair 10, Two Pair 30, Three of a Kind 50, Straight 70, Flush 80, Full House 100, Four of a Kind 150, Straight Flush 200. Eight rounds — eight free shots at the prize pool.\n\nFreerolls attract massive fields: zero buy-in means thousands of recreational players. The early stages are wild because nothing is at stake. Here every deal is free to play but rewarding to win — premium hands count the same. Press Next to grind through eight rounds and post a top freeroll-style score!",
  settings,
  initialState:(seed:number,s:S)=>initialState(seed,s as FreerollTournamentSettings),
  reducer,isTerminal,component:FreerollTournamentGame,
  hint: (state: FreerollTournamentState): HintTarget | null => {
    if (isTerminal(state)) return null;
    if (state.phase === "deal") return { selector: '[data-testid="hint-target-freeroll-tournament-deal"]', pulses: 3 };
    if (state.phase === "scored") return { selector: '[data-testid="hint-target-freeroll-tournament-next"]', pulses: 3 };
    return null;
  },
};
