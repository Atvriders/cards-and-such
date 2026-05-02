import type { GamePlugin, HintTarget } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { WordLadderState, WordLadderAction } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { WordLadder } from "./WordLadder.js";

export const wordLadderSettings = {
  wordLength: {
    kind: "enum" as const,
    label: "Word length",
    options: ["3", "4", "5"] as const,
    default: "4" as const,
  },
  maxMoves: {
    kind: "enum" as const,
    label: "Max moves",
    options: ["8", "12", "20"] as const,
    default: "12" as const,
  },
} as const;

type WordLadderSettingsType = SettingsOf<typeof wordLadderSettings>;

export const wordLadderPlugin: GamePlugin<WordLadderState, WordLadderAction, typeof wordLadderSettings> = {
  id: "word-ladder",
  title: "Word Ladder",
  category: "board",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Change one letter at a time to transform the start word into the target word.",
  howToPlay: `Word Ladder presents you with two words — a start and a target — and asks you to transform one into the other by changing a single letter at a time. Every intermediate step must itself be a valid dictionary word. For example: CAT → CAR → BAR → BAD → BED.

To make a move, type your next word using the keyboard and press Enter, or type in the input area and click Go. The word must be the same length as the start and target words, differ from your current word by exactly one letter, and appear in the built-in word list.

The puzzle is seeded, so every game produces a known-solvable path. Your goal is to reach the target within the allowed number of moves. Fewer moves means a higher score.

Scoring: wins score 1000 minus 50 per move taken (floor of 100). Losing scores 0.

Word length options are 3, 4, or 5 letters. Max moves can be set to 8, 12, or 20 — shorter limits make the puzzle more of a sprint. 4-letter puzzles with 12 moves is the recommended starting point.

Tips: think about the target first and work backwards mentally. Changing vowels is often a quick way to shift from one cluster of words to another. Try to avoid dead ends — words that are hard to escape from.`,
  settings: wordLadderSettings,
  initialState: (seed: number, settings: WordLadderSettingsType) => initialState(seed, settings),
  reducer,
  isTerminal,
  hint: (state: WordLadderState): HintTarget | null => {
    if (state.won || state.lost) return null;
    return { selector: ".wlr-ladder-input-row", pulses: 3 };
  },
  component: WordLadder,
};
