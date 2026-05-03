import { lazy } from "react";
import type * as React from "react";
import type { GamePlugin, HintTarget } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { GameState, GameAction, GameSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
const WordFlowerGame = /* @__PURE__ */ lazy(() => import("./Game.js").then((mod) => ({ default: mod.WordFlowerGame as unknown as React.ComponentType<unknown> })));
const settings = {
  rounds: { kind: "enum" as const, label: "Rounds", options: ["5", "8", "10"] as const, default: "8" as const },
} as const;
type S = SettingsOf<typeof settings>;

export const wordFlowerPlugin: GamePlugin<GameState, GameAction, typeof settings> = {
  id: "word-flower",
  title: "Word Flower",
  category: "board",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Spelling Bee-style word flower puzzle.",
  howToPlay: "Word Flower is a multiple-choice puzzle game inspired by the Word Flower spelling-bee-style puzzle. Each round shows you a prompt or clue, and you must choose the correct answer from four candidate options.\n\nRead the prompt at the top of the screen carefully. The four answer buttons each show a candidate response, but only one of them satisfies the prompt. Tap the option you believe is correct so it highlights in blue, then press Submit to lock in your guess.\n\nCorrect answers earn 100 points and turn the chosen button green. Wrong answers turn red, while the true answer is always revealed so you can learn from each round. Press Next to advance through the bank of puzzles drawn for your session.\n\nEach prompt shows the central letter and outer petals; pick which candidate word is spellable from those letters and uses the central letter. In Settings you can choose how many rounds to play in a single session: 5 for a quick warm-up, 8 for a steady challenge, or 10 for a full sprint through the puzzle bank. Puzzle order is seeded for repeatable runs.",
  settings,
  initialState: (seed: number, s: S) => initialState(seed, s as GameSettings),
  reducer,
  isTerminal,
  hint: (state: GameState): HintTarget | null => {
    if (state.phase === "done" || state.submitted) return null;
    return { selector: ".qz-choices button:first-child", pulses: 3 };
  },
  component: WordFlowerGame,
};
