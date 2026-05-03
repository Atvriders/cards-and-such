import type { GamePlugin, HintTarget } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { CourchevelPokerState, CourchevelPokerAction, CourchevelPokerSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { CourchevelPokerGame } from "./Game.js";
const settings = { dummy: { kind:"boolean" as const, label:"dummy", default:false } } as const;
type S = SettingsOf<typeof settings>;
export const courchevelPokerPlugin: GamePlugin<CourchevelPokerState, CourchevelPokerAction, typeof settings> = {
  id:"courchevel-poker", title:"Courchevel Solo", category:"cards",
  players:{ min:1, max:1, multiplayer:false },
  description:"Solo Courchevel: ten cards (five hole + five community with one exposed pre-flop), best five-card hand scored.",
  howToPlay:"Courchevel Solo brings the Courchevel deal — a flashy Omaha cousin from the French Alps — to a solo seeded round. Press Deal to receive ten cards (five hole + five community) from a fresh 52-card deck.\n\nIn real Courchevel, the first community card is revealed before the flop, hence the name. Here the deal is identical to 5-Card Omaha but the rounds are paced as the more boutique format.\n\nBest five-card poker hand is scored automatically: High Card 0, Pair 10, Two Pair 30, Three of a Kind 50, Straight 70, Flush 80, Full House 100, Four of a Kind 150, Straight Flush 200.\n\nSix rounds. The early-exposed community card in live play causes pre-flop strategic shifts; here the five hole cards make Full Houses extremely common. Press Next between rounds for a Courchevel-style high score chase.",
  settings,
  initialState:(seed:number,s:S)=>initialState(seed,s as CourchevelPokerSettings),
  reducer,isTerminal,  hint: (state: CourchevelPokerState): HintTarget | null => {
    if (isTerminal(state)) return null;
    if (state.phase === "deal") return { selector: '[data-testid="hint-target-courchevel-poker-deal"]', pulses: 3 };
    if (state.phase === "scored") return { selector: '[data-testid="hint-target-courchevel-poker-next"]', pulses: 3 };
    return null;
  },
  component:CourchevelPokerGame,
};
