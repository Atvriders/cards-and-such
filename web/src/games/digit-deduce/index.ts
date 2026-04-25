import type { GamePlugin } from "../../platform/game-plugin/types.js";
import type { DigitState, DigitAction, DigitSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { DigitDeduceGame } from "./Game.js";

const settings = {} as const;

export const digitDeducePlugin: GamePlugin<DigitState, DigitAction, typeof settings> = {
  id: "digit-deduce",
  title: "Digit Deduce",
  category: "board",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Use mathematical clues to deduce a hidden sequence of digits. Sums, products, parity, and more.",
  howToPlay: `Digit Deduce presents you with a hidden sequence of digits (numbers 0–9) and a set of mathematical clues. Your task: use logical deduction to figure out every digit in the sequence.

Clue types you'll encounter: sum constraints ("digits 1 and 2 sum to 10"), product constraints ("digits 3 and 4 have product 12"), parity ("digit 1 is odd/even"), comparisons ("digit 2 is greater than 4"), divisibility ("digit 5 is divisible by 3"), and equality ("digit 3 equals 5").

Use the up/down arrows to set each digit position. When you're satisfied, press Check Answer. If correct, you see your score — calculated based on how many adjustments you made. Fewer moves = higher score.

Strategy: start with equality and divisibility clues, as these pin exact values. Then use sum and product clues with one unknown to solve for it directly. Parity clues narrow choices to odd or even. Cross-reference clues until every digit is forced.

Each puzzle has a unique solution reachable through pure arithmetic deduction — no guessing required if you work systematically. After completing a puzzle, press Next Puzzle to try a new one with different constraints and sequence length.`,
  settings,
  initialState: (seed: number, s: DigitSettings) => initialState(seed, s),
  reducer,
  isTerminal,
  component: DigitDeduceGame,
};
