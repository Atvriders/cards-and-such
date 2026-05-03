import type { GamePlugin, HintTarget } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { Plo6PokerState, Plo6PokerAction, Plo6PokerSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { Plo6PokerGame } from "./Game.js";
const settings = { dummy: { kind:"boolean" as const, label:"dummy", default:false } } as const;
type S = SettingsOf<typeof settings>;
export const plo6PokerPlugin: GamePlugin<Plo6PokerState, Plo6PokerAction, typeof settings> = {
  id:"plo6-poker", title:"PLO6 (Six-Card PLO)", category:"cards",
  players:{ min:1, max:1, multiplayer:false },
  description:"Solo PLO6: six-card Pot-Limit Omaha. Deal seven cards and score the best five-card hand.",
  howToPlay:"PLO6 is six-card Pot-Limit Omaha — the modern internet-cash answer to ever-growing action. Players receive six hole cards and must still use exactly two with three community cards, producing massive numbers of possible hands and dramatic swings. This solo trainer uses a seven-card sample (representing your hole + board) and scores the best five-card subset.\n\nPress Deal each round to receive seven random cards from a fresh 52-card deck. The reducer evaluates every five-card combination and surfaces the strongest poker hand. Values: High Card 0, Pair 10, Two Pair 30, Three of a Kind 50, Straight 70, Flush 80, Full House 100, Four of a Kind 150, Straight Flush 200.\n\nThere are eight independent rounds. Real PLO6 produces nutted hands so often that two-pair is barely a hand — your seven-card sample here creates similar generosity, with pairs and trips landing regularly. Press Next between rounds and stack up the highest possible cumulative score across the full PLO6 session.",
  settings,
  initialState:(seed:number,s:S)=>initialState(seed,s as Plo6PokerSettings),
  reducer, isTerminal,   hint: (state: Plo6PokerState): HintTarget | null => {
    if (isTerminal(state)) return null;
    if (state.phase === "deal") return { selector: '[data-testid="hint-target-plo6-poker-deal"]', pulses: 3 };
    if (state.phase === "scored") return { selector: '[data-testid="hint-target-plo6-poker-next"]', pulses: 3 };
    return null;
  },
  component:Plo6PokerGame,
};
