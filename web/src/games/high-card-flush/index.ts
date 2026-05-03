import type { GamePlugin, HintTarget } from "../../platform/game-plugin/types.js";
import { initialState, reducer, isTerminal, type HCFState, type HCFAction } from "./state.js";
import { HighCardFlush } from "./HighCardFlush.js";

export const hcfSettings = {
  rounds: { kind: "enum" as const, label: "Rounds", options: ["5", "10", "20"] as const, default: "10" as const },
} as const;

export const highCardFlushPlugin: GamePlugin<HCFState, HCFAction, typeof hcfSettings> = {
  id: "high-card-flush",
  title: "High Card Flush",
  category: "cards",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Seven cards each. Longest flush wins. Simple casino comparison.",
  howToPlay: `High Card Flush is a simple casino-style showdown played over several rounds. Each round you and the bot are each dealt seven cards from a standard 52-card deck.

Your goal is to find the longest flush in your hand — that is, the greatest number of cards sharing the same suit. If you hold five spades and two hearts, your best flush is five cards long. The bot does the same with its seven cards.

The player with the longer flush wins the round and earns the bet amount ($100 by default). If both flushes are the same length, the winner is decided by comparing each flush card from highest to lowest (Aces rank highest). If every card matches in value, the round is a draw and the bet is returned.

The game runs for the number of rounds you set (5, 10, or 20). You start with a bankroll of $1,000. Winning rounds grows your bankroll; losing rounds shrinks it. If your bankroll hits zero before the rounds are finished the game ends immediately.

Tips: flushes of 4+ cards are strong; three-card flushes are beatable. There's no decision to make — pure comparison — so enjoy the variance!`,
  settings: hcfSettings,
  initialState,
  reducer,
  isTerminal,
  hint: (state: HCFState): HintTarget | null => {
    if (isTerminal(state)) return null;
    return { selector: '[data-testid="hint-target-high-card-flush-primary"]', pulses: 3 };
  },
  component: HighCardFlush,
};
