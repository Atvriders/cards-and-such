import { lazy } from "react";
import type * as React from "react";
import type { GamePlugin } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { CardPickStreakState, CardPickStreakAction } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
const CardPickStreak = /* @__PURE__ */ lazy(() => import("./Game.js").then((mod) => ({ default: mod.CardPickStreak as unknown as React.ComponentType<unknown> })));
export const cardPickStreakSettings = {
  rounds: { kind: "enum" as const, label: "Rounds", options: ["10", "20"] as const, default: "10" as const },
} as const;

type S = SettingsOf<typeof cardPickStreakSettings>;

export const cardPickStreakPlugin: GamePlugin<CardPickStreakState, CardPickStreakAction, typeof cardPickStreakSettings> = {
  id: "card-pick-streak",
  title: "Card Pick Streak",
  category: "cards",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Two cards face down — pick the higher one and build a streak for bonus points.",
  howToPlay: `Card Pick Streak presents two face-down cards each round. Your job is to pick the one with the higher rank. Build a streak of consecutive correct picks for bonus scoring.

Each round two cards are dealt. Tap the one you believe is higher. If correct, your streak grows: 2 points per correct pick normally, or 5 points per correct pick when you have a streak of 3 or more.

A wrong guess resets your streak to zero. Both cards are revealed after your pick so you can see the result.

The game runs for 10 or 20 rounds. After each round press Next to continue. Your final score and best streak are shown at the end.

Tips: Since the cards are not visible before you pick, the choice involves genuine uncertainty — but you can use deck composition logic. In a fresh shuffled deck, high-value cards and low-value cards are equally distributed. When playing longer sessions (20 rounds), the streaks tend to cluster, rewarding patience. There is no wrong strategy — just pick confidently, enjoy the streaks when they come, and accept the misses with style.`,
  settings: cardPickStreakSettings,
  initialState: (seed: number, settings: S) => initialState(seed, settings),
  reducer,
  isTerminal,
  hint: (state) => isTerminal(state) ? null : ({ selector: '[data-testid="hint-target-card-pick-streak-primary"]', pulses: 3 }),
  component: CardPickStreak,
};
