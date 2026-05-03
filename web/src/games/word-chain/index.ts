import { lazy } from "react";
import type * as React from "react";
import type { GamePlugin, SettingsOf, HintTarget } from "../../platform/game-plugin/types.js";
import type { WordChainState, WordChainAction } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
const WordChain = /* @__PURE__ */ lazy(() => import("./WordChain.js").then((mod) => ({ default: mod.WordChain as unknown as React.ComponentType<unknown> })));
export const wordChainSettings = {
  duration: {
    kind: "enum" as const,
    label: "Time limit",
    options: ["60", "120"] as const,
    default: "60" as const,
  },
} as const;

type WordChainSettingsType = SettingsOf<typeof wordChainSettings>;

export const wordChainPlugin: GamePlugin<WordChainState, WordChainAction, typeof wordChainSettings> = {
  id: "word-chain",
  title: "Word Chain",
  category: "board",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Build a chain of words where each word begins with the last letter of the previous one.",
  howToPlay: `Word Chain is a fast-paced word game where you must link words together in a chain. The last letter of each word you type becomes the required first letter of the next word — building an unbroken sequence against the clock.

At the start of each game a random starting letter is displayed. Your first word must begin with that letter. Type your word on the keyboard and press Enter or the Enter button to submit. If the word is valid and starts with the correct letter, it gets added to the chain. The final letter of that word becomes the starting requirement for your next word.

Words must be at least 3 letters long and must appear in the dictionary. You cannot reuse a word that is already in the chain.

Scoring: each accepted word earns points equal to its letter count, so longer words are more valuable. Try to pick words that end on letters with many common continuations — letters like E, T, S, and N give you many options. Avoid ending on tricky letters like Q, X, or Z which are hard to start a new word with.

Settings let you choose a 60-second or 2-minute session. With practice you can build chains of 20+ words in a minute.`,
  settings: wordChainSettings,
  initialState: (seed: number, settings: WordChainSettingsType) => initialState(seed, settings),
  reducer,
  isTerminal,
  hint: (state: WordChainState): HintTarget | null => {
    if (state.gameOver) return null;
    return { selector: ".wc-input", pulses: 3 };
  },
  component: WordChain,
};
