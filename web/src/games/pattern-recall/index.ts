import { lazy } from "react";
import type * as React from "react";
import type { GamePlugin, SettingsOf, HintTarget} from "../../platform/game-plugin/types.js";
import type { PatternRecallState, PatternRecallAction } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
const PatternRecall = /* @__PURE__ */ lazy(() => import("./Game.js").then((mod) => ({ default: mod.PatternRecall as unknown as React.ComponentType<unknown> })));
export const patternRecallSettings = {
  difficulty: {
    kind: "enum" as const,
    label: "Difficulty",
    options: ["easy", "medium", "hard"] as const,
    default: "medium" as const,
  },
} as const;

type PRSettings = SettingsOf<typeof patternRecallSettings>;

export const patternRecallPlugin: GamePlugin<PatternRecallState, PatternRecallAction, typeof patternRecallSettings> = {
  id: "pattern-recall",
  title: "Pattern Recall",
  category: "board",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Highlighted cells flash briefly on a 4x4 grid. Reproduce the exact pattern from memory!",
  howToPlay: `Pattern Recall challenges your visuospatial working memory. A 4x4 grid of cells is displayed, and for 2.5 seconds some cells light up in orange — forming a pattern you must memorize. The cells then go dark, and it is your turn to click every cell that was highlighted.

You earn points based on how accurately you reproduce the pattern: each correct cell clicked scores points, proportional to the total number of highlighted cells. After you submit, the grid shows you exactly which cells you got right (green), which ones you missed (red highlight), and which wrong cells you clicked (dark red).

There are 8 rounds per game. Easy difficulty highlights 4 cells per round, Medium highlights 7, and Hard highlights 10 out of 16 total cells.

Tips: Rather than scanning the grid randomly, use anchor points. For example, "three cells form an L in the top-left corner, plus one in the middle-right." Translate the visual pattern into a verbal description while it is showing — this dual-coding dramatically improves recall. With Hard mode and 10 highlighted cells, some players find it easier to memorize the 6 dark (unlit) cells instead of the 10 lit ones, since the smaller set is easier to hold.`,
  settings: patternRecallSettings,
  initialState: (seed: number, settings: PRSettings) => initialState(seed, settings),
  reducer,
  isTerminal, hint: (state: PatternRecallState): HintTarget | null => (state.phase === "idle" ? { selector: '[data-testid="hint-target-pattern-recall-primary"]', pulses: 3 } : null),
  component: PatternRecall,
};
