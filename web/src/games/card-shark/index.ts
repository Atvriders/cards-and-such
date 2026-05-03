import { lazy } from "react";
import type * as React from "react";
import type { GamePlugin } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { CardSharkState, CardSharkAction } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
const CardShark = /* @__PURE__ */ lazy(() => import("./CardShark.js").then((mod) => ({ default: mod.CardShark as unknown as React.ComponentType<unknown> })));
export const cardSharkSettings = {
  decks: {
    kind: "enum" as const,
    label: "Decks",
    options: ["1", "2"] as const,
    default: "1" as const,
  },
  rounds: {
    kind: "enum" as const,
    label: "Rounds",
    options: ["10", "20", "30"] as const,
    default: "20" as const,
  },
} as const;

type CardSharkSettingsType = SettingsOf<typeof cardSharkSettings>;

export const cardSharkPlugin: GamePlugin<CardSharkState, CardSharkAction, typeof cardSharkSettings> = {
  id: "card-shark",
  title: "Card Shark",
  category: "cards",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Guess whether the next card is higher or lower and build a winning streak!",
  howToPlay: `Card Shark is a classic higher-or-lower card guessing game. A shuffled deck is drawn card by card. Each turn you see the current face-up card and must predict whether the next hidden card will be higher or lower in value.

Card values run from 2 through 10, then Jack (11), Queen (12), King (13), and Ace (14) as the highest card. Suits do not matter — only rank counts.

Click Higher if you think the next card will have a greater value, or Lower if you think it will be smaller. If both cards share the same rank it is a tie — you earn a small consolation 10 points.

A correct guess earns 50 base points. The real prizes come from streaks: every consecutive correct answer multiplies your bonus. A streak of 5 correct guesses earns 5 × 10 = 50 extra points on top of the base. Build long streaks for massive scores.

A wrong guess resets your streak to zero. Ties leave your streak intact. Statistical reasoning helps — if the current card is a 2, the next one is almost certainly higher. If the current card is an Ace, bet lower.

Play for 10, 20, or 30 rounds. With one deck there are more high cards later after many low cards are revealed. Two decks add variance. Your final score is the cumulative total across all rounds.`,
  settings: cardSharkSettings,
  initialState: (seed: number, settings: CardSharkSettingsType) => initialState(seed, settings),
  reducer,
  isTerminal,
  hint: (state: any) => {
    if (state.over) return null;
    return { selector: '[data-testid="hint-target-card-shark-higher"]', pulses: 3 };
  },
  component: CardShark,
};
