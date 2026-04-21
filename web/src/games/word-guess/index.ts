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
  settings: wordGuessSettings,
  initialState: (seed: number, settings: WordGuessSettingsType) => initialState(seed, settings),
  reducer,
  isTerminal,
  component: WordGuess,
};
