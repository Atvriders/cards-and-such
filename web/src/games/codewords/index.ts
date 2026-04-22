import type { GamePlugin } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { CodewordsState, CodewordsAction } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { Codewords } from "./Codewords.js";

export const codewordsSettings = {
  difficulty: {
    kind: "enum" as const,
    label: "Difficulty",
    options: ["easy", "medium", "hard"] as const,
    default: "easy" as const,
  },
} as const;

type CodewordsSettingsType = SettingsOf<typeof codewordsSettings>;

export const codewordsPlugin: GamePlugin<CodewordsState, CodewordsAction, typeof codewordsSettings> = {
  id: "codewords",
  title: "Codewords",
  category: "board",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Decode a crossword where every letter is replaced by a number 1–26.",
  howToPlay: `Codewords is a crossword variant where every letter in every word has been replaced by a number from 1 to 26. The same number always represents the same letter throughout the entire puzzle, and each number maps to exactly one letter.

Your task is to figure out which number corresponds to which letter by analyzing the patterns, word shapes, and letter frequencies. You are given 2–3 starter mappings to get you going — these pre-filled letters appear highlighted in the grid.

To make a guess: click a numbered cell in the grid or click a numbered chip in the code panel below the grid. This selects that code. Then type the letter you believe it represents on your keyboard, or click a letter button. If correct guesses cascade, surrounding cells will fill in automatically.

You win when every number in the grid has been correctly mapped to its letter and all words are complete and consistent.

Scoring starts at 1000 and drops by 20 per guess, with a floor of 100. Fewer guesses — better score.

Tips: look for short words first — a two-letter word with a repeated structure might be "be," "do," or "to." Three-letter words often end in common letters. The most frequent code in the grid usually maps to E, the most common English letter. Given starters reveal letters across the whole puzzle at once, so follow their chains.`,
  settings: codewordsSettings,
  initialState: (seed: number, settings: CodewordsSettingsType) => initialState(seed, settings),
  reducer,
  isTerminal,
  component: Codewords,
};
