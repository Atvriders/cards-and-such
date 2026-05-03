import type { GamePlugin } from "../../platform/game-plugin/types.js";
import type { SafeCrackerState, SafeCrackerAction, SafeCrackerSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { SafeCrackerGame } from "./Game.js";

const settings = {} as const;

export const safeCrackerPlugin: GamePlugin<SafeCrackerState, SafeCrackerAction, typeof settings> = {
  id: "safe-cracker",
  title: "Safe Cracker",
  category: "board",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Crack the 4-digit numeric code to open the safe — each attempt gives exact and misplaced digit hints.",
  howToPlay: `Safe Cracker is a numeric code-breaking puzzle. The safe is locked by a 4-digit secret code, each digit between 0 and 9. You have 8 attempts to crack it.

After each attempt, you receive two pieces of feedback: the number of digits that are exactly right (correct digit in the correct position, shown as ✓), and the number of digits that are in the code but in the wrong position (shown as ~). Digits are counted independently, so if the code is 1122 and you guess 1234, you get 1 exact (the first 1) and 1 misplaced (the 2).

Use the up/down arrows to set each digit of your guess, then press Try Code. Study the feedback row by row. Start with a diagnostic guess that covers a spread of digits. Narrow down possibilities using deductive logic.

Score is based on attempts used: cracking the code on attempt 1 gives 1400 points; each additional attempt reduces the score by 200. Failing to crack the code gives 0.

Tip: once you get 4 exactmatches in some positions, keep those digits fixed and only vary the others. With careful analysis, you can crack most codes in 5 or fewer attempts.`,
  settings,
  initialState: (seed: number, s: SafeCrackerSettings) => initialState(seed, s),
  reducer,
  isTerminal,
  hint: (s: any) => { const p = (s as any).phase; if (p === "done" || p === "gameover" || p === "ended" || p === "finished" || (s as any).gameOver || (s as any).won || (s as any).complete || (s as any).isComplete) return null; return { selector: ".sc-up-btn", pulses: 3 }; },
  component: SafeCrackerGame,
};
