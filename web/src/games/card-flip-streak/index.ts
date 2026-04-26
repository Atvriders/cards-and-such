import type { GamePlugin } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { CardFlipStreakState, CardFlipStreakAction } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { CardFlipStreak } from "./Game.js";

export const cardFlipStreakSettings = {
  rounds: { kind: "enum" as const, label: "Rounds", options: ["10", "20"] as const, default: "10" as const },
} as const;

type S = SettingsOf<typeof cardFlipStreakSettings>;

export const cardFlipStreakPlugin: GamePlugin<CardFlipStreakState, CardFlipStreakAction, typeof cardFlipStreakSettings> = {
  id: "card-flip-streak",
  title: "Card Flip Streak",
  category: "cards",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Flip cards hoping for red — earn bonus points for consecutive red cards.",
  howToPlay: `Card Flip Streak is a luck-based card mini-game with a streak mechanic. Each round you flip one card from a shuffled deck, hoping it is red (Hearts or Diamonds).

If the card is red, your streak increases and you earn points: 2 points for a normal flip, but 5 points per flip when your streak is 3 or higher. If the card is black (Spades or Clubs), your streak resets to zero and you earn nothing.

There is no decision to make beyond pressing Flip — this is a game of chasing streaks and riding luck. Track your best streak across all rounds.

After each flip, press Next to continue. The game ends after 10 or 20 rounds depending on settings. Your total score is reported at the end.

Tips: Roughly half the deck is red and half black, so your chance per flip is always near 50%. The key strategy is enjoying the streaks — watch for the bonus threshold at 3 consecutive reds. A run of 5 or 6 red cards in a row can generate a big score burst. Shorter sessions (10 rounds) are more volatile; longer sessions (20 rounds) tend to even out.`,
  settings: cardFlipStreakSettings,
  initialState: (seed: number, settings: S) => initialState(seed, settings),
  reducer,
  isTerminal,
  component: CardFlipStreak,
};
