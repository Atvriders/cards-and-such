import type { GamePlugin, HintTarget } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { TensOrBetterState, TensOrBetterAction, TensOrBetterSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { TensOrBetterGame } from "./Game.js";
const settings = { dummy: { kind:"boolean" as const, label:"dummy", default:false } } as const;
type S = SettingsOf<typeof settings>;
export const tensOrBetterPlugin: GamePlugin<TensOrBetterState, TensOrBetterAction, typeof settings> = {
  id:"tens-or-better", title:"Tens or Better (VP)", category:"cards",
  players:{ min:1, max:1, multiplayer:false },
  description:"Solo Tens or Better video poker: a pair of tens or higher would normally pay. Deal five cards and score the best hand.",
  howToPlay:"Tens or Better is a Jacks-or-Better cousin that lowers the minimum paying hand to a pair of tens — a friendlier paytable for casual players. This solo trainer hands you five cards from a fresh 52-card deck and scores them under the standard hand-rank table; every pair here counts toward your score.\n\nPress Deal each round to receive five random cards. Hand values: High Card 0, Pair 10, Two Pair 30, Three of a Kind 50, Straight 70, Flush 80, Full House 100, Four of a Kind 150, Straight Flush 200.\n\nThere are ten independent rounds. Tens or Better lowers the qualifying bar enough that recreational play feels generous — here, every pair already credits your score, so think of every round as an opportunity to push past the minimum and toward a stronger hand. Press Next between rounds and see if you can chain enough two-pairs and trips to top your previous cumulative best.",
  settings,
  initialState:(seed:number,s:S)=>initialState(seed,s as TensOrBetterSettings),
  reducer, isTerminal,   hint: (state: TensOrBetterState): HintTarget | null => {
    if (isTerminal(state)) return null;
    if (state.phase === "deal") return { selector: '[data-testid="hint-target-tens-or-better-deal"]', pulses: 3 };
    if (state.phase === "scored") return { selector: '[data-testid="hint-target-tens-or-better-next"]', pulses: 3 };
    return null;
  },
  component:TensOrBetterGame,
};
