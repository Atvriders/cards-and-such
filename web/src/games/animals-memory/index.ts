import { lazy } from "react";
import type * as React from "react";
import type { GamePlugin, SettingsOf } from "../../platform/game-plugin/types.js";
import type { AnimalsMemoryState, AnimalsMemoryAction, AnimalsMemorySettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
const AnimalsMemoryGame = /* @__PURE__ */ lazy(() => import("./Game.js").then((mod) => ({ default: mod.AnimalsMemoryGame as unknown as React.ComponentType<unknown> })));
const settings = { dummy: { kind: "boolean" as const, label: "dummy", default: false } } as const;
type S = SettingsOf<typeof settings>;

export const animalsMemoryPlugin: GamePlugin<AnimalsMemoryState, AnimalsMemoryAction, typeof settings> = {
  id: "animals-memory",
  title: "Animals Memory",
  category: "board",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Match wildlife photo pairs.",
  howToPlay: "Animals Memory is a memory and observation challenge built around quick recall. Each of fifteen rounds shows a brief prompt referencing one item from a fixed pool of cards, and asks you to pick the matching name from four candidates. Correct answers earn ten points (max 150), and the answer is revealed each round so you can learn the pool over time.\n\nThe game pool is fixed — every round draws from the same set of items, so as you play you build familiarity. Read the prompt carefully; the cue may describe a visual feature, a category, or a trait. Click your answer, then Submit to lock, then Next to advance. Wrong picks show the correct answer in green and your guess in red. There is no time pressure, so take a moment to scan options before committing.\n\nStrong scores are 130+; perfect 150 requires careful attention to detail. Use this game to train pattern recognition, observational accuracy, and memory association — skills that transfer to all matching, recall, and trivia games. Good luck!",
  settings,
  initialState: (seed: number, s: S) => initialState(seed, s as AnimalsMemorySettings),
  reducer,
  isTerminal,
  hint: (state: AnimalsMemoryState) => {
    if (state.phase === "done") return null;
    return { selector: ".anmlmem-btn.submit, .anmlmem-btn.next", pulses: 3 };
  },
  component: AnimalsMemoryGame,
};
