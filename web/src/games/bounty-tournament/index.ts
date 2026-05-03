import type { GamePlugin, HintTarget } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { BountyTournamentState, BountyTournamentAction, BountyTournamentSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { BountyTournamentGame } from "./Game.js";
const settings = { dummy: { kind:"boolean" as const, label:"dummy", default:false } } as const;
type S = SettingsOf<typeof settings>;
export const bountyTournamentPlugin: GamePlugin<BountyTournamentState, BountyTournamentAction, typeof settings> = {
  id:"bounty-tournament", title:"Bounty Tournament Solo", category:"cards",
  players:{ min:1, max:1, multiplayer:false },
  description:"Solo tournament-style poker hand challenge with bounty bonuses for premium hands.",
  howToPlay:"Bounty Tournament Solo simulates the cash-bounty knockout format where every elimination earns a payout. Press Deal each round to receive seven cards (two hole + five board) and the engine evaluates the best five-card poker hand among all combinations.\n\nHand values: High Card 0, Pair 10, Two Pair 30, Three of a Kind 50, Straight 70, Flush 80, Full House 100, Four of a Kind 150, Straight Flush 200. There are nine rounds total — analogous to nine bounty levels in a real KO event.\n\nIn live KO tournaments, busting an opponent who has a head bounty pays cash on top of the standard prize pool — making aggression and ICM-light strategy correct in many spots. Here the bounty analog is the score itself: every premium hand collected adds to your stack of bounties. Press Next after each round to chase the highest cumulative bounty haul!",
  settings,
  initialState:(seed:number,s:S)=>initialState(seed,s as BountyTournamentSettings),
  reducer,isTerminal,  hint: (state: BountyTournamentState): HintTarget | null => {
    if (isTerminal(state)) return null;
    if (state.phase === "deal") return { selector: '[data-testid="hint-target-bounty-tournament-deal"]', pulses: 3 };
    if (state.phase === "scored") return { selector: '[data-testid="hint-target-bounty-tournament-next"]', pulses: 3 };
    return null;
  },
  component:BountyTournamentGame,
};
