import { lazy } from "react";
import type * as React from "react";
import type { GamePlugin, HintTarget } from "../../platform/game-plugin/types.js";
import type { CompoundState, CompoundAction } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
const CompoundWord = /* @__PURE__ */ lazy(() => import("./Game.js").then((mod) => ({ default: mod.CompoundWord as unknown as React.ComponentType<unknown> })));
export const compoundWordSettings = {} as const;

export const compoundWordPlugin: GamePlugin<CompoundState, CompoundAction, typeof compoundWordSettings> = {
  id: "compound-word",
  title: "Compound Word",
  category: "board",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Combine two word clues into one compound word. 10 puzzles per round!",
  howToPlay: `Compound Word presents two word clues side by side — for example BOOK + WORM. Your task is to combine them into a single compound word: BOOKWORM.

Each puzzle shows the two component words in large blue and green letters, plus a brief plain-language hint for each part. Type the compound word in the input box and press Enter or tap Go to submit.

A correct answer scores 100 points and advances you to the next puzzle. An incorrect answer gives you a hint about your letter count so you can try again. Use the Skip button if you are completely stuck — it moves to the next puzzle but scores zero for that one.

There are 10 puzzles per game, drawn from a pool of 45 compound-word pairs. The selection is randomized each session.

Score is the total correct answers × 100, with a maximum of 1000. Aim to solve as many as possible without skipping.

Tips: read both hints carefully — sometimes the clue word is used in an unusual sense. Remember that compound words can run together (SUNFLOWER), be hyphenated, or be written as two words, but the expected answer is always a single string of letters.`,
  settings: compoundWordSettings,
  initialState: (seed: number) => initialState(seed),
  reducer,
  isTerminal,
  hint: (state: CompoundState): HintTarget | null => {
    if (state.phase === "done") return null;
    return { selector: ".compound-input", pulses: 3 };
  },
  component: CompoundWord,
};
