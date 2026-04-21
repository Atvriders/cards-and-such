import type { GamePlugin } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { WordGuessState, WordGuessAction } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { WordGuess } from "./WordGuess.js";

export const wordGuessSettings = {
  wordLength: {
    kind: "enum" as const,
    label: "Word length",
    options: ["4", "5", "6"] as const,
    default: "5" as const,
  },
  maxAttempts: {
    kind: "enum" as const,
    label: "Attempts",
    options: ["5", "6", "7"] as const,
    default: "6" as const,
  },
} as const;

type WordGuessSettingsType = SettingsOf<typeof wordGuessSettings>;

export const wordGuessPlugin: GamePlugin<WordGuessState, WordGuessAction, typeof wordGuessSettings> = {
  id: "word-guess",
  title: "Word Guess",
  category: "board",
  players: { min: 1, max: 1, multiplayer: false },
  description:
    "Guess the hidden word. Green = right letter, right spot. Yellow = right letter, wrong spot.",
  howToPlay: `Guess a secret word in as few attempts as possible. Each guess must be a valid word of the chosen length (4, 5, or 6 letters). Type the word and press Enter to submit.

After each guess the tiles change color. Green means the letter is correct and in the right position. Yellow means the letter is in the word but in the wrong position. Gray means the letter is not in the word at all. Use these clues to narrow down the answer with each subsequent guess.

Score on a win is (maxAttempts − attempts + 1) × 100, so solving in fewer guesses earns more points. You can configure the number of maximum attempts (5, 6, or 7) in settings. A wrong final guess with no letters left ends the game with the answer revealed.

Tips: Start with words that cover common letters such as E, A, R, I, O, T, N, S. After the first guess, prioritize placing yellows in new positions. Avoid reusing gray letters.`,
  settings: wordGuessSettings,
  initialState: (seed: number, settings: WordGuessSettingsType) => initialState(seed, settings),
  reducer,
  isTerminal,
  component: WordGuess,
};
