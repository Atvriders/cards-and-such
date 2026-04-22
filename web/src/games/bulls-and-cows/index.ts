import type { GamePlugin } from "../../platform/game-plugin/types.js";
import type { BullsAndCowsState, BullsAndCowsAction, BullsAndCowsSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { BullsAndCows } from "./Game.js";

export const bullsAndCowsSettings = {
  codeLength: {
    kind: "enum" as const,
    label: "Code Length",
    options: ["3", "4", "5"] as const,
    default: "4",
  },
  allowRepeats: {
    kind: "boolean" as const,
    label: "Allow Repeated Digits",
    default: false,
  },
} as const;

export const bullsAndCowsPlugin: GamePlugin<BullsAndCowsState, BullsAndCowsAction, typeof bullsAndCowsSettings> = {
  id: "bulls-and-cows",
  title: "Bulls & Cows",
  category: "board",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Guess a secret number — bulls are correct digit and position, cows are correct digit in wrong place.",
  howToPlay: `Bulls and Cows is a classic number-deduction game. The computer picks a secret code — a sequence of digits (0–9) with no repeated digits by default. Your job is to crack it within 10 guesses.

After each guess the game reports bulls and cows. A bull means one of your digits is exactly right: correct value in the correct position. A cow means a digit appears in the secret code but in a different position. Neither bulls nor cows tell you which specific positions are right or wrong — only the totals.

To guess: tap the digit buttons to build your number, then tap Go to submit. Use the back arrow to erase the last digit. The code length (3, 4, or 5 digits) and whether repeats are allowed can be adjusted in Settings before starting.

Scoring: score = max(0, 1100 minus guesses used × 100). Solving on the first try gives 1000 points; solving on the tenth gives 100 points. Failing to solve gives 0.

Strategy tip: start with a guess that spreads across many different digits (e.g., 1234). Use the bull and cow counts to eliminate possibilities systematically each round.`,
  settings: bullsAndCowsSettings,
  initialState: (seed: number, s: BullsAndCowsSettings) => initialState(seed, s),
  reducer,
  isTerminal,
  component: BullsAndCows,
};
