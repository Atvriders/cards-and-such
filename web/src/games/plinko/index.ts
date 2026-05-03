import { lazy } from "react";
import type * as React from "react";
import type { GamePlugin } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { PlinkoState, PlinkoAction } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
const Plinko = /* @__PURE__ */ lazy(() => import("./Plinko.js").then((mod) => ({ default: mod.Plinko as unknown as React.ComponentType<unknown> })));
export const plinkoSettings = {
  chips: {
    kind: "enum" as const,
    label: "Chips",
    options: ["5", "10", "20"] as const,
    default: "10" as const,
  },
  rows: {
    kind: "enum" as const,
    label: "Rows",
    options: ["8", "12", "16"] as const,
    default: "8" as const,
  },
} as const;

type PlinkoSettingsType = SettingsOf<typeof plinkoSettings>;

export const plinkoPlugin: GamePlugin<PlinkoState, PlinkoAction, typeof plinkoSettings> = {
  id: "plinko",
  title: "Plinko",
  category: "board",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Drop chips through a peg maze. Center slots pay the most.",
  howToPlay: `Drop chips from the top of a triangular peg board and watch them bounce their way to the bottom. At every peg the chip randomly bounces left or right, so the final slot is determined by the laws of probability — and a seeded random number generator.

Slot values are highest at the center and lower toward the edges, following a pyramid-shaped payout structure. The center slot can be worth 100 or more points while outer slots may be worth only 5. Your total score is the sum of all chip payouts.

Choose how many chips you get (5, 10, or 20) and how many rows the board has (8, 12, or 16). More rows mean the chip bounces more times, which pushes the distribution toward the center by the law of large numbers — so with 16 rows you are more likely to land near the center than with 8. Fewer rows means higher variance and a better chance of landing in an extreme outer slot.

Tips: There is no skill involved in where a chip lands — each drop is random. The real choice is whether to drop all chips one at a time and enjoy each result, or to maximize rounds played. With more rows, expect tighter clustering around center slots and more consistent, moderate scores.`,
  settings: plinkoSettings,
  initialState: (seed: number, settings: PlinkoSettingsType) => initialState(seed, settings),
  reducer,
  isTerminal,
  hint: (s: any) => { const p = (s as any).phase; if (p === "gameover" || p === "done" || p === "ended" || (s as any).gameOver) return null; return { selector: '[data-testid="hint-target-plinko-action"]', pulses: 3 }; },
  component: Plinko,
};
