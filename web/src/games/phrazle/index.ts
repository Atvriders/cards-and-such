import { lazy } from "react";
import type * as React from "react";
import type { GamePlugin } from "../../platform/game-plugin/types.js";
import type { PhrazleState, PhrazleAction } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
const Phrazle = /* @__PURE__ */ lazy(() => import("./Game.js").then((mod) => ({ default: mod.Phrazle as unknown as React.ComponentType<unknown> })));
export const phrazleSettings = {} as const;

export const phrazlePlugin: GamePlugin<PhrazleState, PhrazleAction, typeof phrazleSettings> = {
  id: "phrazle",
  title: "Phrazle",
  category: "board",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Guess the hidden phrase in six tries — like Wordle but for idioms and expressions!",
  howToPlay: `Phrazle is a phrase-guessing game inspired by Wordle. Instead of a single word, you must guess a multi-word phrase or idiom hidden behind the tiles.

You have six attempts to guess the complete phrase. Each attempt must fill in all the letters of the phrase — spaces are inserted automatically as you type, so you never need to press the spacebar.

After each guess the tiles change color. Green means the letter is correct and in exactly the right position. Yellow means the letter appears in the phrase but is in the wrong spot. Gray means the letter does not appear in the phrase at all.

Use the color clues to narrow down which letters belong where. The phrase bank is drawn from well-known English idioms, proverbs, and common expressions.

Score is (maxAttempts − guesses + 1) × 100, so solving in fewer attempts earns more points. A failed sixth guess reveals the answer with a score of zero.

Tips: Start by guessing the most common letters — E, A, R, I, O, T, N, S — spread across the phrase. Watch for yellows and try those letters in new positions. Short connecting words like THE, AND, OF often anchor the phrase.`,
  settings: phrazleSettings,
  initialState: (seed: number) => initialState(seed),
  reducer,
  isTerminal,
  hint: (s: any) => { const p = (s as any).phase; if (p === "gameover" || p === "done" || p === "ended" || (s as any).gameOver || (s as any).won || (s as any).isWon || (s as any).isComplete || (s as any).complete) return null; return { selector: '[data-testid="hint-target-phrazle-action"]', pulses: 3 }; },
  component: Phrazle,
};
