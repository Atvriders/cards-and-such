import type { GamePlugin, HintTarget } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { WordSearchState, WordSearchAction } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { WordSearch } from "./WordSearch.js";

export const wordSearchSettings = {
  size: {
    kind: "enum" as const,
    label: "Grid size",
    options: ["8", "12", "15"] as const,
    default: "12" as const,
  },
  wordCount: {
    kind: "enum" as const,
    label: "Word count",
    options: ["5", "10", "15"] as const,
    default: "10" as const,
  },
} as const;

type WordSearchSettingsType = SettingsOf<typeof wordSearchSettings>;

export const wordSearchPlugin: GamePlugin<WordSearchState, WordSearchAction, typeof wordSearchSettings> = {
  id: "word-search",
  title: "Word Search",
  category: "board",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Find the hidden words in a grid of letters. Words can go in any direction.",
  howToPlay: `Word Search gives you a grid of letters with hidden words concealed in every direction — horizontally, vertically, and diagonally, both forwards and backwards. Your job is to find all the words before running out of patience!

The list of hidden words appears on the right side of the grid. To select a word, click the first letter and drag to the last letter. If the letters form a straight line that matches a word in the list, the word is highlighted green and crossed off the list. Keep going until every word is found.

The grid size (8×8, 12×12, or 15×15) controls how spacious the puzzle is. Smaller grids with more words are trickier because words compete for space and overlap frequently. Larger grids with fewer words are more relaxed.

Scoring: 1000 minus 10 per selection attempt, floored at 100. Try to find each word in one clean swipe to maximise your score.

Tips: Scan for the first letter of each word, then look in all eight directions for the next letter. Longer words are often easier to spot because they rule out many directions immediately. Work through shorter words last since they hide more easily among the random letters.`,
  settings: wordSearchSettings,
  initialState: (seed: number, settings: WordSearchSettingsType) => initialState(seed, settings),
  reducer,
  isTerminal,
  hint: (state: WordSearchState): HintTarget | null => {
    if (state.won) return null;
    return { selector: ".word-search-grid", pulses: 3 };
  },
  component: WordSearch,
};
