import { lazy } from "react";
import type * as React from "react";
import type { GamePlugin } from "../../platform/game-plugin/types.js";
import { initialState, reducer, isTerminal, type NumberGuesserState, type NumberGuesserAction } from "./state.js";
const NumberGuesser = /* @__PURE__ */ lazy(() => import("./NumberGuesser.js").then((mod) => ({ default: mod.NumberGuesser as unknown as React.ComponentType<unknown> })));
export const numberGuesserSettings = {
  range: { kind: "enum" as const, label: "Range", options: ["100", "1000", "10000"] as const, default: "100" as const },
  maxAttempts: { kind: "enum" as const, label: "Max Attempts", options: ["5", "7", "10", "14"] as const, default: "7" as const },
} as const;

export const numberGuesserPlugin: GamePlugin<NumberGuesserState, NumberGuesserAction, typeof numberGuesserSettings> = {
  id: "number-guesser",
  title: "Number Guesser",
  category: "board",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Binary search a hidden number. Each guess narrows the range.",
  howToPlay: `The bot has secretly picked a number within a range (default 1–100). Your job is to find it in as few guesses as possible before you run out of attempts.

Type your guess or use the slider, then click Guess. After each guess the bot tells you whether the secret number is higher or lower. Use that information to narrow down the range with each attempt.

The optimal strategy is binary search: always guess the midpoint of the remaining range. For a range of 100, binary search guarantees a solution in at most 7 guesses (since 2⁷ = 128 > 100). For 1,000 you need at most 10; for 10,000 at most 14.

Scoring rewards efficiency: you earn (maxAttempts − attemptsUsed + 1) × 100 points for a correct guess. Finding the number on your first attempt yields the maximum score; guessing right on the last attempt yields 100 points. A failed game (out of attempts) scores 0.

Settings: choose a larger range and tighter attempt limit for a real challenge, or start with 100 / 7 for a gentle introduction. Your history of guesses and hints is shown below the input to help you track the remaining possibilities.`,
  settings: numberGuesserSettings,
  initialState,
  reducer,
  isTerminal,
  hint: (s: any) => { const p = (s as any).phase; if (p === "gameover" || p === "done" || p === "ended" || (s as any).gameOver || (s as any).won || (s as any).isWon || (s as any).isComplete || (s as any).complete) return null; return { selector: '[data-testid="hint-target-number-guesser-action"]', pulses: 3 }; },
  component: NumberGuesser,
};
