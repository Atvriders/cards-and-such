import type { GamePlugin, SettingsOf } from "../../platform/game-plugin/types.js";
import type { TextTwistState, TextTwistAction } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { TextTwist } from "./TextTwist.js";

export const textTwistSettings = {
  duration: {
    kind: "enum" as const,
    label: "Time limit",
    options: ["120", "180"] as const,
    default: "120" as const,
  },
  targetWordLength: {
    kind: "enum" as const,
    label: "Target word length",
    options: ["5", "6", "7"] as const,
    default: "6" as const,
  },
} as const;

type TextTwistSettingsType = SettingsOf<typeof textTwistSettings>;

export const textTwistPlugin: GamePlugin<TextTwistState, TextTwistAction, typeof textTwistSettings> = {
  id: "text-twist",
  title: "Text Twist",
  category: "board",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Unscramble 6 letters into as many words as possible — find the long target word!",
  howToPlay: `Text Twist gives you a set of scrambled letters (5, 6, or 7 depending on settings) and starts a countdown timer. Your goal is to form as many valid English words as possible using only those letters — and you must find the full-length target word to maximize your score.

Building a word: click the letter tiles to add them to your current entry, or type letters on your keyboard. Each letter can only be used as many times as it appears in the set. Press Enter or the Enter button to submit. Press Backspace to delete the last letter, or Clear to erase the whole entry. Press Space or the Twist button to scramble the tile order and see new patterns.

Scoring: every valid word scores 10 points per letter. Finding the target word adds a 50-point bonus on top.

Words must be at least 3 letters long. Duplicate submissions are rejected. You do not have to find the target word to score points from shorter words, but you cannot "advance" without it.

Tips: after hitting Twist a few times you often spot hidden words you missed. Always start by scanning for common 3-letter combinations — ATE, OUR, THE, AID — to build a score base while you work toward the longer target. Prefixes like UN-, RE-, and suffixes like -ING, -ED, -ER frequently appear in the letter sets.`,
  settings: textTwistSettings,
  initialState: (seed: number, settings: TextTwistSettingsType) => initialState(seed, settings),
  reducer,
  isTerminal,
  component: TextTwist,
};
