import { lazy } from "react";
import type * as React from "react";
import type { GamePlugin, HintTarget } from "../../platform/game-plugin/types.js";
import type { BoggleProState, BoggleProAction } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
const BoggleProGame = /* @__PURE__ */ lazy(() => import("./Game.js").then((mod) => ({ default: mod.BoggleProGame as unknown as React.ComponentType<unknown> })));
export const boggleProPlugin = {
  id: "boggle-pro",
  title: "Boggle Pro",
  category: "board",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Find words in a 4x4 letter grid — longer words score more points. You have 20 attempts!",
  howToPlay: `Boggle Pro challenges you to find as many words as possible in a randomly generated 4×4 letter grid. You have 20 word attempts — use them wisely!

To form a valid word, all its letters must appear in the grid (a single grid letter can only be used once per word). Words must be at least 3 letters long and must exist in the built-in dictionary.

Longer words are rewarded generously: 3-letter words score 1 point, 4-letter words score 2, 5-letter words score 4, 6-letter words score 6, 7-letter words score 10, and 8+ letter words score 14 points.

Type a word and press Submit to check it. Duplicate words score nothing. If you cannot find a word on a turn, click Pass to skip without penalty — but you lose that attempt.

Strategy: scan for common letter combinations like -ing, -tion, -tion, -ed, -er, and -est to build longer words. High-value letters like Q, Z, X, and J rarely appear, but common vowel clusters often enable surprising words. Click End Game at any time to score what you have found!`,
  settings: {} as const,
  initialState: (seed: number) => initialState(seed),
  reducer: reducer as (state: BoggleProState, action: BoggleProAction) => BoggleProState,
  isTerminal,
  hint: (state: BoggleProState): HintTarget | null => {
    if (state.phase === "done") return null;
    return { selector: ".bg-input-row", pulses: 3 };
  },
  component: BoggleProGame,
} as unknown as GamePlugin;
