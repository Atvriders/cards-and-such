import type { GamePlugin, HintTarget } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { HoldemPotLimitState, HoldemPotLimitAction, HoldemPotLimitSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { HoldemPotLimitGame } from "./Game.js";
const settings = { dummy: { kind:"boolean" as const, label:"dummy", default:false } } as const;
type S = SettingsOf<typeof settings>;
export const holdemPotLimitPlugin: GamePlugin<HoldemPotLimitState, HoldemPotLimitAction, typeof settings> = {
  id:"holdem-pot-limit", title:"Hold'em Pot-Limit Solo", category:"cards",
  players:{ min:1, max:1, multiplayer:false },
  description:"Pot-Limit Hold'em solo dealer: deal seven cards, best five-card poker hand scores.",
  howToPlay:"Hold'em Pot-Limit Solo simulates the deal of pot-limit Texas Hold'em without the betting. Each round, press Deal to draw seven random cards from a 52-card deck, representing your two hole cards plus the five community-board cards.\n\nThe hand is automatically scored by picking the best five-card poker combination from those seven. Scoring: High Card 0, Pair 10, Two Pair 30, Three of a Kind 50, Straight 70, Flush 80, Full House 100, Four of a Kind 150, Straight Flush 200.\n\nPot-Limit means in the live game you can never bet more than the pot's current size — it forces tight, position-aware play. Here the structural mirror is that you're locked to a fixed eight rounds, so each deal counts.\n\nWatch for monster Full Houses and Quads in the seven-card spread — they're significantly more common than in five-card draw. Tap Next to advance after each round and try for the all-time high.",
  settings,
  initialState:(seed:number,s:S)=>initialState(seed,s as HoldemPotLimitSettings),
  reducer, isTerminal,   hint: (state: HoldemPotLimitState): HintTarget | null => {
    if (isTerminal(state)) return null;
    if (state.phase === "deal") return { selector: '[data-testid="hint-target-holdem-pot-limit-deal"]', pulses: 3 };
    if (state.phase === "scored") return { selector: '[data-testid="hint-target-holdem-pot-limit-next"]', pulses: 3 };
    return null;
  },
  component:HoldemPotLimitGame,
};
