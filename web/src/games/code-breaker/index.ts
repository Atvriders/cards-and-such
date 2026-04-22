import type { GamePlugin } from "../../platform/game-plugin/types.js";
import type { CodeBreakerState, CodeBreakerAction, CodeBreakerSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { CodeBreaker } from "./Game.js";

const settings = {} as const;

export const codeBreakerPlugin: GamePlugin<CodeBreakerState, CodeBreakerAction, typeof settings> = {
  id: "code-breaker",
  title: "Code Breaker",
  category: "board",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Crack a 5-color code in 8 guesses. Spend hint tokens to reveal positions.",
  howToPlay: `Code Breaker is a Mastermind-style deduction game with a twist: you have hint tokens you can spend to reveal a secret color.

The computer hides a 5-color code chosen from 7 colors: red, orange, yellow, green, blue, purple, and pink. Colors may repeat. You have 8 guesses to crack it.

After each guess you see two numbers: bulls (correct color in correct position) and cows (correct color in wrong position). These totals don't identify which specific pegs are correct — only the counts.

You start with 3 hint tokens. Clicking "Use Hint" reveals one position's exact color and locks it into your next guess. Revealed positions are highlighted in gold and cannot be cleared. Each hint costs 50 points from your final score.

To make a guess: click a peg slot to select it (it turns blue), then click a color in the palette. The selection automatically advances to the next slot. Click Submit when all 5 slots are filled.

Score = max(0, (9 − guesses used) × 100 − hints used × 50). Cracking the code on guess 1 with no hints gives 800 points.

Strategy: treat it like Mastermind but use hints as a last resort — the score penalty is steep.`,
  settings,
  initialState: (seed: number, s: CodeBreakerSettings) => initialState(seed, s),
  reducer,
  isTerminal,
  component: CodeBreaker,
};
