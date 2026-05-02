import type { GamePlugin, HintTarget } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { HangmanState, HangmanAction } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { Hangman } from "./Hangman.js";

export const hangmanSettings = {
  wordLength: {
    kind: "enum" as const,
    label: "Word length",
    options: ["any", "short", "medium", "long"] as const,
    default: "any" as const,
  },
  maxWrong: {
    kind: "enum" as const,
    label: "Max wrong",
    options: ["6", "8", "10"] as const,
    default: "6" as const,
  },
} as const;

type HangmanSettingsType = SettingsOf<typeof hangmanSettings>;

export const hangmanPlugin: GamePlugin<HangmanState, HangmanAction, typeof hangmanSettings> = {
  id: "hangman",
  title: "Hangman",
  category: "board",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Guess the hidden word letter by letter before the hangman is complete.",
  howToPlay: `Reveal the hidden word by guessing one letter at a time before the hangman figure is fully drawn.

Click any letter on the on-screen keyboard (or press a key) to guess it. If the letter appears in the word, all matching positions are revealed. If the letter is not in the word, a wrong guess is counted and the next part of the hangman is drawn. The game ends when you correctly reveal every letter (win) or the hangman is complete (lose).

Score on a win is (maxWrong − wrongGuesses) × 50 + wordLength × 10. Guessing with fewer wrong answers and longer words earns more points. Settings control the word-length category (any, short, medium, or long) and the maximum allowed wrong guesses (6, 8, or 10).

Tips: Begin with the most common letters in English — E, T, A, O, I, N, S, H, R. Vowels first will help you spot the word pattern quickly. Avoid guessing uncommon letters like Q, X, Z, or J until you have a strong idea of the word. Pay attention to double letters: if you see a pattern with a blank next to a known letter, the blank may be the same letter.`,
  settings: hangmanSettings,
  initialState: (seed: number, settings: HangmanSettingsType) => initialState(seed, settings),
  reducer,
  isTerminal,
  hint: (state: HangmanState): HintTarget | null => {
    if (state.won || state.lost) return null;
    return { selector: ".hgm-keyboard", pulses: 3 };
  },
  component: Hangman,
};
