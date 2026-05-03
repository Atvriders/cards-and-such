import { lazy } from "react";
import type * as React from "react";
import type { GamePlugin } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { KakurasuState, KakurasuAction, KakurasuSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
const Kakurasu = /* @__PURE__ */ lazy(() => import("./Kakurasu.js").then((mod) => ({ default: mod.Kakurasu as unknown as React.ComponentType<unknown> })));
export const kakurasuSettings = {
  difficulty: {
    kind: "enum" as const,
    label: "Difficulty",
    options: ["easy", "medium", "hard"] as const,
    default: "easy",
  },
} as const;

type KakurasuSettingsType = SettingsOf<typeof kakurasuSettings>;

export const kakurasuPlugin: GamePlugin<KakurasuState, KakurasuAction, typeof kakurasuSettings> = {
  id: "kakurasu",
  title: "Kakurasu",
  category: "board",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Shade cells so row sums (column values) and column sums (row values) match the clues.",
  howToPlay: `Kakurasu is a binary-matrix logic puzzle. You have an N×N grid where each column has a fixed weight equal to its column number (column 1 = weight 1, column 2 = weight 2, and so on). Similarly, each row has a row weight equal to its row number.

The puzzle gives you two sets of clues: a target sum for each row, and a target sum for each column. For rows, the sum is calculated by adding up the column weights of all shaded cells in that row. For columns, the sum is calculated by adding up the row weights of all shaded cells in that column.

Click any cell to shade it (dark blue) or unshade it. The current running sum shown in red or green next to each row/column label lets you track your progress. Green means the sum matches the target; red means it's off.

Strategy: rows and columns with very high clues must shade many high-weight cells. Start with the largest and smallest clue values — they constrain which cells can be shaded. Try every combination of weights that add up to the row clue, then cross-check with column clues. Unlike Nonograms, shaded cells don't need to be contiguous.`,
  settings: kakurasuSettings,
  initialState: (seed: number, settings: KakurasuSettingsType) => initialState(seed, settings),
  reducer,
  isTerminal,
  hint: (s: any) => { const p = (s as any).phase; if (p === "gameover" || p === "done" || p === "ended" || (s as any).gameOver || (s as any).won || (s as any).isWon || (s as any).isComplete || (s as any).complete) return null; return { selector: '[data-testid="hint-target-kakurasu-action"]', pulses: 3 }; },
  component: Kakurasu,
};
