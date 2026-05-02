import type { GamePlugin, HintTarget } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { WordScrambleState, WordScrambleAction } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { WordScramble } from "./WordScramble.js";

export const wordScrambleSettings = {
  difficulty: {
    kind: "enum" as const,
    label: "Difficulty",
    options: ["easy", "medium", "hard"] as const,
    default: "medium" as const,
  },
} as const;

type WordScrambleSettingsType = SettingsOf<typeof wordScrambleSettings>;

export const wordScramblePlugin: GamePlugin<WordScrambleState, WordScrambleAction, typeof wordScrambleSettings> = {
  id: "word-scramble",
  title: "Word Scramble",
  category: "board",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Unscramble jumbled letters to spell the correct word before time runs out.",
  howToPlay: `You are shown a word whose letters have been randomly scrambled. Your goal is to rearrange those letters in your head and type the correct word.

Type your answer in the input box and press Submit (or Enter) to check it. If you are stuck, press Hint to reveal one more letter from the beginning of the word — each hint costs 10 points. Press Skip to move to the next word at no score gain.

Each correct answer scores up to 50 points. Using hints reduces the bonus: one hint costs 10 points, two hints cost 20 points, and so on. Ten words are presented per game. Your final score is the total of all correct answers.

Difficulty controls word length. Easy uses short 3-letter words. Medium uses 5-letter words. Hard uses 6-letter words with less common vocabulary.

Tips: Look for common letter patterns — TH, SH, CH, ING, -ED, -ER. Vowels often anchor a word; find them first and build around them. Double letters are a helpful clue: if you see two of the same letter, they likely stay together or are separated by just one letter. Try consonant clusters you recognize and test different placements mentally before typing.`,
  settings: wordScrambleSettings,
  initialState: (seed: number, settings: WordScrambleSettingsType) => initialState(seed, settings),
  reducer: (state: WordScrambleState, action: WordScrambleAction) => reducer(state, action, 0),
  isTerminal,
  hint: (state: WordScrambleState): HintTarget | null => {
    if (state.solved || state.skipped) return null;
    return { selector: ".ws-input", pulses: 3 };
  },
  component: WordScramble,
};
