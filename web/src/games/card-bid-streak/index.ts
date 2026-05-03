import { lazy } from "react";
import type * as React from "react";
import type { GamePlugin } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { CardBidStreakState, CardBidStreakAction } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
const CardBidStreak = /* @__PURE__ */ lazy(() => import("./Game.js").then((mod) => ({ default: mod.CardBidStreak as unknown as React.ComponentType<unknown> })));
export const cardBidStreakSettings = {
  rounds: { kind: "enum" as const, label: "Rounds", options: ["10", "20"] as const, default: "10" as const },
} as const;

type S = SettingsOf<typeof cardBidStreakSettings>;

export const cardBidStreakPlugin: GamePlugin<CardBidStreakState, CardBidStreakAction, typeof cardBidStreakSettings> = {
  id: "card-bid-streak",
  title: "Card Bid Streak",
  category: "cards",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Guess higher or lower each round — build a streak for bonus coins.",
  howToPlay: `Card Bid Streak is a fast card guessing game where you predict whether the next card drawn will be higher or lower than the current one. Correct guesses earn you coins and extend your streak.

Each round a card is shown. Tap Higher or Lower to predict the next card. A correct guess earns 1 coin, but when your streak reaches 3 or more consecutive correct guesses, each correct answer earns 3 coins instead — streaks are where the real points are.

A wrong guess resets your streak to zero. The goal is to build and maintain the longest streak possible over 10 or 20 rounds.

After revealing the result, press Next to continue. Card ranks run from 2 (lowest) to Ace (highest). Equal-ranked cards from different suits do not count as higher or lower; the guess will resolve based on rank only.

Choose 10 or 20 rounds in settings. Tips: Watch the current rank carefully — a 2 is almost always going higher; a King or Ace is likely going lower. Middle-rank cards like 7 and 8 are the trickiest. Protect a long streak by playing conservatively when you see borderline cards.`,
  settings: cardBidStreakSettings,
  initialState: (seed: number, settings: S) => initialState(seed, settings),
  reducer,
  isTerminal,
  hint: (state) => isTerminal(state) ? null : ({ selector: '[data-testid="hint-target-card-bid-streak-primary"]', pulses: 3 }),
  component: CardBidStreak,
};
