import type { GamePlugin, HintTarget } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { FusionPokerState, FusionPokerAction, FusionPokerSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { FusionPokerGame } from "./Game.js";
const settings = { dummy: { kind:"boolean" as const, label:"dummy", default:false } } as const;
type S = SettingsOf<typeof settings>;
export const fusionPokerPlugin: GamePlugin<FusionPokerState, FusionPokerAction, typeof settings> = {
  id:"fusion-poker", title:"Fusion Poker", category:"cards",
  players:{ min:1, max:1, multiplayer:false },
  description:"Solo Fusion Poker: Hold'em/PLO hybrid where one hole card swaps for a community card. Deal seven cards and score the best five.",
  howToPlay:"Fusion Poker is a clever Hold'em/PLO hybrid: players start with two hole cards (Hold'em style), then receive an additional hole card on the flop and another on the turn. By the river, players have four hole cards just like Omaha — but no must-use-two restriction. This solo trainer condenses the experience: deal seven cards and score the best five.\n\nPress Deal each round to receive seven random cards from a fresh 52-card deck. The reducer evaluates every five-card subset and surfaces the strongest poker hand. Values: High Card 0, Pair 10, Two Pair 30, Three of a Kind 50, Straight 70, Flush 80, Full House 100, Four of a Kind 150, Straight Flush 200.\n\nYou play eight independent rounds. Real Fusion Poker rewards players who can read how their growing hole-card pool interacts with the developing board — here the seven-card sample captures the spirit. Press Next between rounds and try to maximize your cumulative session score.",
  settings,
  initialState:(seed:number,s:S)=>initialState(seed,s as FusionPokerSettings),
  reducer,isTerminal,  hint: (state: FusionPokerState): HintTarget | null => {
    if (isTerminal(state)) return null;
    if (state.phase === "deal") return { selector: '[data-testid="hint-target-fusion-poker-deal"]', pulses: 3 };
    if (state.phase === "scored") return { selector: '[data-testid="hint-target-fusion-poker-next"]', pulses: 3 };
    return null;
  },
  component:FusionPokerGame,
};
