import { lazy } from "react";
import type * as React from "react";
import type { GamePlugin } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { CardColorStreakState, CardColorStreakAction } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
const CardColorStreak = /* @__PURE__ */ lazy(() => import("./CardColorStreak.js").then((mod) => ({ default: mod.CardColorStreak as unknown as React.ComponentType<unknown> })));
export const cardColorStreakSettings = {
  rounds: { kind: "enum" as const, label: "Rounds", options: ["5", "10", "15"] as const, default: "10" as const },
} as const;
type S = SettingsOf<typeof cardColorStreakSettings>;

export const cardColorStreakPlugin: GamePlugin<CardColorStreakState, CardColorStreakAction, typeof cardColorStreakSettings> = {
  id: "card-color-streak",
  title: "Card Color Streak",
  category: "cards",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Guess the color of the next card and build a streak for bonus points.",
  howToPlay: `Card Color Streak is a streak-building guessing game. You see the current card and must predict whether the next card drawn from the deck will be red (hearts or diamonds) or black (spades or clubs).

Click Red or Black to make your guess. The card is revealed immediately. A correct guess earns base points plus a streak bonus — the longer your correct streak, the more you earn per correct answer.

A correct guess earns 5 points plus 2 extra points for each consecutive correct answer in your current streak. One wrong guess resets your streak to zero.

Play 5, 10, or 15 rounds depending on your settings. Your final score and best streak are displayed at the end.

Tips: There is no guaranteed strategy since the deck is randomly shuffled, but tracking how many red and black cards have appeared can give you a slight edge. If you have seen many black cards, red becomes slightly more likely. Aim to maintain long streaks for maximum points.`,
  settings: cardColorStreakSettings,
  initialState: (seed: number, settings: S) => initialState(seed, settings),
  reducer,
  isTerminal,
  hint: (state: CardColorStreakState) => {
    if (state.phase === "done" || state.phase === "reveal") return null;
    return { selector: ".ccs-btn", pulses: 3 };
  },
  component: CardColorStreak,
};
