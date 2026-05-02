import type { GamePlugin, HintTarget } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { AnagramState, AnagramAction } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { Anagram } from "./Anagram.js";

export const anagramSettings = {
  wordLength: {
    kind: "enum" as const,
    label: "Word length",
    options: ["5", "6", "7"] as const,
    default: "6" as const,
  },
  maxGuesses: {
    kind: "enum" as const,
    label: "Max guesses",
    options: ["3", "5", "10"] as const,
    default: "5" as const,
  },
} as const;

type AnagramSettingsType = SettingsOf<typeof anagramSettings>;

export const anagramPlugin: GamePlugin<AnagramState, AnagramAction, typeof anagramSettings> = {
  id: "anagram",
  title: "Anagram",
  category: "board",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Find the original word from a scrambled letter set.",
  howToPlay: `Anagram presents you with a set of letters — scrambled from a real English word — and asks you to rearrange them into the original word. There is one specific target word to find.

Type your guess using the keyboard (click the puzzle area first to focus it) and press Enter to submit. Each guess must use exactly the same letters as the scrambled set shown — no extra letters, no missing letters. If your guess does not use the same letters, it counts as a wrong attempt.

You have a limited number of guesses (configurable: 3, 5, or 10). If you use them all without finding the correct word, the answer is revealed.

Scoring: (maxGuesses − attemptsUsed + 1) × 200, with a floor of 100. Finding the word on the first guess yields the maximum score; wrong guesses cost you.

Settings: word length (5, 6, or 7 letters) and max guesses. Six-letter words with five guesses is the recommended starting point — challenging but fair. Seven-letter words with three guesses is expert mode.

Tips: look for common prefixes (un-, re-, pre-) or suffixes (-ing, -ed, -tion, -ness). If you see double letters, think of words that use them. Arrange the letters by frequency to spot familiar clusters.`,
  settings: anagramSettings,
  initialState: (seed: number, settings: AnagramSettingsType) => initialState(seed, settings),
  reducer,
  isTerminal,
  hint: (state: AnagramState): HintTarget | null => {
    if (state.won || state.lost) return null;
    return { selector: '[data-testid="hint-target-anagram-input"]', pulses: 3 };
  },
  component: Anagram,
};
