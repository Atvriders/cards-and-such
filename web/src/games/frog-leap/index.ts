import { lazy } from "react";
import type * as React from "react";
import type { GamePlugin } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { FrogLeapState, FrogLeapAction, FrogLeapSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
const FrogLeap = /* @__PURE__ */ lazy(() => import("./Game.js").then((mod) => ({ default: mod.FrogLeap as unknown as React.ComponentType<unknown> })));
const settings = {
  jumps: { kind: "enum" as const, label: "Jumps", options: ["8", "12", "16"] as const, default: "12" as const },
} as const;

type S = SettingsOf<typeof settings>;

export const frogLeapPlugin: GamePlugin<FrogLeapState, FrogLeapAction, typeof settings> = {
  id: "frog-leap",
  title: "Frog Leap",
  category: "arcade",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Guide your frog across lily pads! Farther jumps score more points. Plan your route!",
  howToPlay: `Frog Leap is a strategy-meets-arcade game. Your frog sits on a lily pad in a pond. Six lily pads are scattered around the pond. Click any pad to make your frog leap to it.

The farther your jump, the more points you score! Each jump is scored by calculating the distance between your current pad and the destination pad. So aim for the most distant pad you can reach to maximize your score.

After each jump, the pad you left behind is replaced with a fresh one at a new random position — so the layout changes with every leap. Plan your route carefully to string together long-distance jumps.

Use Settings to choose 8, 12, or 16 total jumps. The frog cannot jump to the pad it is currently sitting on.

The game ends when you run out of jumps. Your total score is the sum of all jump distances. Can you plan a route that racks up the maximum distance across all your jumps?`,
  settings,
  initialState: (seed: number, s: S) => initialState(seed, s as FrogLeapSettings),
  reducer, isTerminal, hint: (s: any) => { const p = (s as any).phase; if (p === "gameover" || p === "done" || p === "ended" || (s as any).gameOver) return null; return { selector: '[data-testid="hint-target-frog-leap-action"]', pulses: 3 }; }, component: FrogLeap,
};
