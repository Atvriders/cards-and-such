import type { GamePlugin, HintTarget } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { ClosedChinesePokerState, ClosedChinesePokerAction, ClosedChinesePokerSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { ClosedChinesePokerGame } from "./Game.js";
const settings = { dummy: { kind:"boolean" as const, label:"dummy", default:false } } as const;
type S = SettingsOf<typeof settings>;
export const closedChinesePokerPlugin: GamePlugin<ClosedChinesePokerState, ClosedChinesePokerAction, typeof settings> = {
  id:"closed-chinese-poker", title:"Closed Chinese Poker Solo", category:"cards",
  players:{ min:1, max:1, multiplayer:false },
  description:"Solo Closed Chinese Poker: 13 cards arranged in three hands, best five-card scored.",
  howToPlay:"Closed Chinese Poker Solo simulates the Chinese Poker (Closed) format where each player arranges 13 cards into three hands — top (3 cards), middle (5), and bottom (5) — then reveals all at once.\n\nPress Deal each round to receive 13 cards from a 52-card deck. The best five-card poker hand among the 13 (representing your best bottom-row hand) is scored.\n\nHand values: High Card 0, Pair 10, Two Pair 30, Three of a Kind 50, Straight 70, Flush 80, Full House 100, Four of a Kind 150, Straight Flush 200.\n\nIn live Closed Chinese Poker, the placement strategy is everything — the bottom must beat the middle, which must beat the top. Here the seeded deal lets you watch the variance.\n\nFour rounds. Big hands are extremely common given the 13-card spread. Press Next between rounds and try multiple seeds.",
  settings,
  initialState:(seed:number,s:S)=>initialState(seed,s as ClosedChinesePokerSettings),
  reducer,isTerminal,  hint: (state: ClosedChinesePokerState): HintTarget | null => {
    if (isTerminal(state)) return null;
    if (state.phase === "deal") return { selector: '[data-testid="hint-target-closed-chinese-poker-deal"]', pulses: 3 };
    if (state.phase === "scored") return { selector: '[data-testid="hint-target-closed-chinese-poker-next"]', pulses: 3 };
    return null;
  },
  component:ClosedChinesePokerGame,
};
