import type { GamePlugin } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { CardHigh3State, CardHigh3Action } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { CardHigh3 } from "./Game.js";

export const cardHigh3Settings = {
  rounds: { kind: "enum" as const, label: "Rounds", options: ["10", "20"] as const, default: "10" as const },
} as const;

type S = SettingsOf<typeof cardHigh3Settings>;

export const cardHigh3Plugin: GamePlugin<CardHigh3State, CardHigh3Action, typeof cardHigh3Settings> = {
  id: "card-high-3",
  title: "Card High 3",
  category: "cards",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Draw 3 cards — the higher the combined value, the more points you earn.",
  howToPlay: `Card High 3 is the opposite of Card Low 3 — you draw three cards and score based on how high their combined value is. Face cards count as 10; Aces as 11 (making them the most valuable); number cards at face value.

Each round press Deal to draw three cards. Scoring tiers:
- Sum 30 or more: 20 points (exceptional high hand)
- Sum 24 to 29: 10 points (strong high hand)
- Sum 18 to 23: 5 points (decent high hand)
- Sum 17 or less: 0 points

No decisions required — pure card luck. Aim to accumulate points over 10 or 20 rounds.

Press Next after each hand. Your running total score appears at the top.

Tips: The theoretical maximum is three Aces (sum = 33). A hand with two or more face cards (or Aces) will almost always score at least 5 points. The hardest outcome is getting all low cards (three 2s through 5s) with a sum below 18. In practice, average hands will land in the 18–24 range for 5–10 points. Over 20 rounds, 150–180 points is a strong run.`,
  settings: cardHigh3Settings,
  initialState: (seed: number, settings: S) => initialState(seed, settings),
  reducer,
  isTerminal,
  component: CardHigh3,
};
