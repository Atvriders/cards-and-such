import { lazy } from "react";
import type * as React from "react";
import type { GamePlugin, SettingsOf } from "../../platform/game-plugin/types.js";
import type { QuordleState, QuordleAction } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
const Quordle = /* @__PURE__ */ lazy(() => import("./Quordle.js").then((mod) => ({ default: mod.Quordle as unknown as React.ComponentType<unknown> })));
export const quordleSettings = {} as const;

type QuordleSettingsType = SettingsOf<typeof quordleSettings>;

export const quordlePlugin: GamePlugin<QuordleState, QuordleAction, typeof quordleSettings> = {
  id: "quordle",
  title: "Quordle",
  category: "board",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Guess four 5-letter words simultaneously in 9 tries. Like Wordle times four!",
  howToPlay: `Quordle is like Wordle, but you must solve four 5-letter words at the same time. Every guess you type applies to all four grids at once, and you have only 9 total guesses to crack all four.

Type a 5-letter word and press Enter to submit a guess. The letters in each grid will change color: green means the letter is correct and in the right position; yellow means the letter is in the target word but in the wrong spot; gray means the letter does not appear in that word at all. The color-coding is independent for each grid.

The on-screen keyboard at the bottom tracks the best result for each letter across all grids. Use it to spot which letters you have confirmed or eliminated.

Score is based on how many words you solved and how many guesses you used. Solving all four earns a bigger bonus, and using fewer guesses adds extra points.

Tips: your first couple of guesses should use common letters — try words rich in vowels and frequent consonants like R, S, T, L, N. Pay close attention to the letter colors in each grid separately: a yellow letter in grid 2 tells you something different from a gray in grid 1. As you narrow in, focus your later guesses on the grids where you have the fewest confirmed letters. Good luck!`,
  settings: quordleSettings,
  initialState: (seed: number, settings: QuordleSettingsType) => initialState(seed, settings),
  reducer,
  isTerminal,
  hint: (s: any) => { const p = (s as any).phase; if (p === "done" || p === "gameover" || p === "ended" || p === "finished" || (s as any).gameOver || (s as any).won || (s as any).complete || (s as any).isComplete) return null; return { selector: ".qrd-enter", pulses: 3 }; },
  component: Quordle,
};
