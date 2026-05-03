import type { GamePlugin, HintTarget } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { FreezeoutTournamentState, FreezeoutTournamentAction, FreezeoutTournamentSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { FreezeoutTournamentGame } from "./Game.js";
const settings = { dummy: { kind:"boolean" as const, label:"dummy", default:false } } as const;
type S = SettingsOf<typeof settings>;
export const freezeoutTournamentPlugin: GamePlugin<FreezeoutTournamentState, FreezeoutTournamentAction, typeof settings> = {
  id:"freezeout-tournament", title:"Freezeout Tournament Solo", category:"cards",
  players:{ min:1, max:1, multiplayer:false },
  description:"Solo freezeout-format poker; no rebuys, ten one-shot rounds.",
  howToPlay:"Freezeout Tournament Solo simulates the classic no-rebuy format — once you bust, you're out. Press Deal each round to receive seven cards (two hole + five board) and the engine grades the best five-card poker hand from your seven.\n\nHand values: High Card 0, Pair 10, Two Pair 30, Three of a Kind 50, Straight 70, Flush 80, Full House 100, Four of a Kind 150, Straight Flush 200. Ten rounds total — each is a freezeout level you can't redo.\n\nIn live freezeouts, bankroll discipline rules: with no rebuys allowed, every chip must be defended like its survival counts. Premium hands matter more in deep stack early levels; bubble-survival kicks in late. Here you get ten consecutive deals — make every one count toward your final score. Press Next to roll forward!",
  settings,
  initialState:(seed:number,s:S)=>initialState(seed,s as FreezeoutTournamentSettings),
  reducer,isTerminal,  hint: (state: FreezeoutTournamentState): HintTarget | null => {
    if (isTerminal(state)) return null;
    if (state.phase === "deal") return { selector: '[data-testid="hint-target-freezeout-tournament-deal"]', pulses: 3 };
    if (state.phase === "scored") return { selector: '[data-testid="hint-target-freezeout-tournament-next"]', pulses: 3 };
    return null;
  },
  component:FreezeoutTournamentGame,
};
