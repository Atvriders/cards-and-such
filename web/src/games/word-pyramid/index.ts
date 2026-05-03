import { lazy } from "react";
import type * as React from "react";
import type { GamePlugin, HintTarget } from "../../platform/game-plugin/types.js";
import type { WordPyramidState, WordPyramidAction } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
const WordPyramid = /* @__PURE__ */ lazy(() => import("./Game.js").then((mod) => ({ default: mod.WordPyramid as unknown as React.ComponentType<unknown> })));
export const wordPyramidSettings = {} as const;

export const wordPyramidPlugin: GamePlugin<WordPyramidState, WordPyramidAction, typeof wordPyramidSettings> = {
  id: "word-pyramid",
  title: "Word Pyramid",
  category: "board",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Build a word pyramid — each row adds one letter and rearranges the previous row.",
  howToPlay: `Word Pyramid is a vocabulary puzzle where you must fill in a descending pyramid of words. Row 1 has 1 letter, row 2 has 2 letters, row 3 has 3, and so on up to 7 letters.

The key rule is that every word in the pyramid uses all the letters of the row above it plus exactly one new letter, rearranged in any order. So if row 2 is AT, a valid row 3 might be TAR — it uses A and T plus the new letter R.

Each row shows a brief clue to help you find the right word. Type your answer in the input box next to each row. You can fill in the rows in any order, using the clues to guide you.

When you are happy with your answers, click Check Answers. Correct answers turn green; incorrect ones turn red. Your score is 100 points per correct row.

If you are stuck on a specific row, click Reveal to see the answer — but that row earns zero points.

Tips: start from the top (shortest words) and work your way down, carrying your letters through. If a later row doesn't feel right, reconsider an earlier one — the chain of letters must be consistent.`,
  settings: wordPyramidSettings,
  initialState: (seed: number) => initialState(seed),
  reducer,
  isTerminal,
  hint: (state: WordPyramidState): HintTarget | null => {
    if (state.phase === "done") return null;
    return { selector: ".pyramid-input", pulses: 3 };
  },
  component: WordPyramid,
};
