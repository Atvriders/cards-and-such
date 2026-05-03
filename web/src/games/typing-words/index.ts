import { lazy } from "react";
import type * as React from "react";
import type { GamePlugin, HintTarget } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { TypingWordsState, TypingWordsAction } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
const TypingWords = /* @__PURE__ */ lazy(() => import("./TypingWords.js").then((mod) => ({ default: mod.TypingWords as unknown as React.ComponentType<unknown> })));
export const typingWordsSettings = {
  duration: {
    kind: "enum" as const,
    label: "Duration",
    options: ["30", "60", "120"] as const,
    default: "60" as const,
  },
  difficulty: {
    kind: "enum" as const,
    label: "Difficulty",
    options: ["easy", "medium", "hard"] as const,
    default: "medium" as const,
  },
} as const;

type TypingWordsSettingsType = SettingsOf<typeof typingWordsSettings>;

export const typingWordsPlugin: GamePlugin<TypingWordsState, TypingWordsAction, typeof typingWordsSettings> = {
  id: "typing-words",
  title: "Typing Words",
  category: "arcade",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Type a stream of words as fast as you can before the timer runs out. Space or Enter submits each word.",
  howToPlay: `A stream of words appears at the top of the screen. Your goal is to type each word correctly and move on to the next as quickly as possible before the timer expires.

Type the highlighted current word in the input box. Press Space or Enter to submit it and advance to the next word. If your typed word matches the target exactly, it counts as correct. Any mismatch counts as incorrect.

Your score is calculated as correct words multiplied by your accuracy percentage. For example, 40 correct words with 95% accuracy gives a score of 38. Typing fast but making many errors will lower your score, so aim for a balance of speed and precision.

The word list is shuffled fresh each game using a random seed so you will encounter words in a different order every time. Easy mode uses common short words, medium adds more variety, and hard introduces longer, more complex vocabulary.

Tips: Keep your eyes on the next word as you finish the current one so you can anticipate what is coming. Do not look at the keyboard — focus on the screen. If you mistype a word, you can backspace and correct it before pressing Space, but use backspace sparingly to avoid losing time. Practice the home-row position to reduce finger travel and build speed over time.`,
  settings: typingWordsSettings,
  initialState: (seed: number, settings: TypingWordsSettingsType) => initialState(seed, settings),
  reducer,
  isTerminal,
  hint: (state: TypingWordsState): HintTarget | null => {
    if (state.ended) return null;
    return { selector: ".tw-input", pulses: 3 };
  },
  component: TypingWords,
};
