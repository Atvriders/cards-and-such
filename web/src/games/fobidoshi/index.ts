import { lazy } from "react";
import type * as React from "react";
import type { GamePlugin, HintTarget } from "../../platform/game-plugin/types.js";
import type { FobidoshiState, FobidoshiAction, FobidoshiSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
const FobidoshiGame = /* @__PURE__ */ lazy(() => import("./Game.js").then((mod) => ({ default: mod.FobidoshiGame as unknown as React.ComponentType<unknown> })));
const settings = { dummy: { kind: "boolean" as const, label: "dummy", default: false } } as const;
export const fobidoshiPlugin: GamePlugin<FobidoshiState, FobidoshiAction, typeof settings> = {
  id: "fobidoshi",
  title: "Fobidoshi",
  category: "board",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Place circles in grid; circles cannot be adjacent. Some cells have forbidden numbers indicating circle counts in row and column.",
  howToPlay: "Fobidoshi (sometimes \"forbidden circles\") places small circles into grid cells. Two rules govern placement: (1) circles cannot occupy orthogonally adjacent cells (no two circles touching at a side), and (2) certain cells contain forbidden-pattern hints — typically a number meaning \"exactly this many circles in this cell's row\" or \"this many circles in this column.\"\n\nThe non-adjacency rule strongly limits how many circles you can place in any row. Combined with row/column count clues, the puzzle becomes a tile-and-counting exercise.\n\nEach puzzle shows a small grid with hint numbers. A target cell is highlighted with four candidate values: circle, blank, or distractor descriptors. Apply the adjacency and count rules to find the unique correct value.\n\nSix puzzles per round; 100 points per correct answer plus a time bonus. Wrong picks reveal the correct value. Fobidoshi is a quick, crunchy logic puzzle — easy to teach, surprisingly satisfying to crack.",
  settings,
  initialState: (seed: number) => initialState(seed, { dummy: true } as FobidoshiSettings),
  reducer,
  isTerminal,
  
  hint: (state: FobidoshiState): HintTarget | null => state.phase === "playing" ? { selector: '[data-testid="hint-target-fobidoshi-answer-0"]', pulses: 3 } : null,component: FobidoshiGame,
};
