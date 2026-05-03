import { lazy } from "react";
import type * as React from "react";
import type { GamePlugin, SettingsOf } from "../../platform/game-plugin/types.js";
import type { RainbowState, RainbowAction } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
const RainbowSort = /* @__PURE__ */ lazy(() => import("./Game.js").then((mod) => ({ default: mod.RainbowSort as unknown as React.ComponentType<unknown> })));
export const rainbowSortSettings = {
  rounds: {
    kind: "enum" as const,
    label: "Rounds",
    options: ["5", "8", "10"] as const,
    default: "5" as const,
  },
} as const;

type RainbowSortSettings = SettingsOf<typeof rainbowSortSettings>;

export const rainbowSortPlugin: GamePlugin<RainbowState, RainbowAction, typeof rainbowSortSettings> = {
  id: "rainbow-sort",
  title: "Rainbow Sort",
  category: "arcade",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Sort colorful drops into the right buckets — a bright color-recognition game for kids!",
  howToPlay: `Rainbow Sort is a colorful sorting game. Each round, a big colored raindrop falls from the sky. Below it are six colored buckets — red, orange, yellow, green, blue, and purple.

Your job is simple: click the bucket that matches the color of the drop! If the drop is green, click the green bucket. If it is orange, click the orange bucket.

You score points for each correct sort. Wrong sorts score zero for that round, so look carefully at the color of the drop before you click. The game moves fast, so stay alert!

Play for 5, 8, or 10 rounds. Each correct answer earns an equal share of 100 points, so every round matters. Your running score and round number are shown at the top.

This game is great for learning color names and building quick visual recognition skills. Challenge yourself to get a perfect score without any mistakes!`,
  settings: rainbowSortSettings,
  initialState: (seed: number, settings: RainbowSortSettings) => initialState(seed, settings),
  reducer,
  isTerminal,
  hint: (s: any) => { const p = (s as any).phase; if (p === "gameover" || p === "done" || p === "ended" || (s as any).gameOver) return null; return { selector: '[data-testid="hint-target-rainbow-sort-action"]', pulses: 3 }; },
  component: RainbowSort,
};
