import type { GamePlugin, HintTarget } from "../../platform/game-plugin/types.js";
import type { CashCabState, CashCabAction, CashCabSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { CashCab } from "./Game.js";

const settings = {
  questions: {
    kind: "enum" as const,
    label: "Questions",
    options: ["10", "15", "20"] as const,
    default: "10" as const,
  },
} as const;

export const cashCabPlugin: GamePlugin<CashCabState, CashCabAction, typeof settings> = {
  id: "cash-cab",
  title: "Cash Cab",
  category: "board",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Start with $50 and double your cash for every correct trivia answer. Stop and bank it — or risk it all on the next question.",
  howToPlay: `Cash Cab is a trivia and risk-management game. You start with $50 in your wallet. The ride begins and trivia questions start rolling.

Each question is multiple-choice with four options. If you answer correctly, your current cash total doubles. If you are wrong, $50 is deducted from your total (the total can drop to zero but never goes negative). There are 10, 15, or 20 questions depending on your chosen setting.

The twist: after every question (whether you got it right or wrong), you face a choice — Stop and Keep your current cash balance, ending the game immediately, or Continue Riding and risk your winnings on the next question.

The doubling mechanic means the rewards grow quickly. A run of ten correct answers starting from $50 would yield $51,200. But a single wrong answer along the way costs $50 and resets your doubling streak from the new lower amount.

Strategy: conservative players should stop when they have a comfortable amount; aggressive players push through to maximize doubling. If your cash falls low, the risk of continuing may be worth it since you can't lose more than $50 per wrong answer.

Questions span geography, science, math, history, sports, and pop culture. Every game shuffles the question order for a fresh experience.`,
  settings,
  initialState: (seed: number, s: CashCabSettings) => initialState(seed, s),
  reducer,
  isTerminal,
  
  hint: (state: CashCabState): HintTarget | null => state.phase === "playing" ? { selector: '[data-testid="hint-target-cash-cab-answer-0"]', pulses: 3 } : null,component: CashCab,
} as unknown as GamePlugin;
