import { lazy } from "react";
import type * as React from "react";
import type { GamePlugin, HintTarget } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { LetterBoxedState, LetterBoxedAction } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
const LetterBoxed = /* @__PURE__ */ lazy(() => import("./LetterBoxed.js").then((mod) => ({ default: mod.LetterBoxed as unknown as React.ComponentType<unknown> })));
export const letterBoxedSettings = {
  difficulty: {
    kind: "enum" as const,
    label: "Difficulty",
    options: ["easy", "medium", "hard"] as const,
    default: "medium" as const,
  },
} as const;

type LetterBoxedSettingsType = SettingsOf<typeof letterBoxedSettings>;

export const letterBoxedPlugin: GamePlugin<LetterBoxedState, LetterBoxedAction, typeof letterBoxedSettings> = {
  id: "letter-boxed",
  title: "Letter Boxed",
  category: "board",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Connect all 12 letters around the box using as few words as possible.",
  howToPlay: `Letter Boxed presents a square box with 3 letters on each of its 4 sides — 12 unique letters total. Your mission is to use every single letter in the box by forming valid English words, using as few words as possible.

The rules are simple but tricky: within each word, consecutive letters must come from DIFFERENT sides of the box. So if you pick a letter from the top side, the next letter must come from the left, right, or bottom side — never the top again.

There's a chaining rule too: each new word must begin with the final letter of the previous word. This forces you to think ahead and plan your path through the puzzle.

Type letters using your keyboard, or tap the letters displayed on the box sides. Press Enter or click Submit to play a word. The letters you have used turn highlighted so you can track progress.

Scoring: you win when every letter in the box has been used. Fewer words = higher score. A one-word solution (if possible) earns maximum points. Each additional word used reduces your bonus.

Tips: look for long words that use letters from multiple sides. Try to end each word on a letter you still need to cover. Common endings like -ING, -TION, or -LY are useful if those letters appear on different sides.`,
  settings: letterBoxedSettings,
  initialState: (seed: number, settings: LetterBoxedSettingsType) => initialState(seed, settings),
  reducer,
  isTerminal,
  hint: (state: LetterBoxedState): HintTarget | null => {
    if (state.won || state.lost) return null;
    return { selector: ".lbx-wrap", pulses: 3 };
  },
  component: LetterBoxed,
};
