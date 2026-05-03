import { lazy } from "react";
import type * as React from "react";
import type { GamePlugin, HintTarget } from "../../platform/game-plugin/types.js";
import type { RideTheBusState } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
const RideTheBusGame = /* @__PURE__ */ lazy(() => import("./Game.js").then((mod) => ({ default: mod.RideTheBusGame as unknown as React.ComponentType<unknown> })));
export const rideTheBusSettings = {
  rounds: { kind: "enum" as const, label: "Rounds", options: ["3", "5", "7"] as const, default: "5" as const },
} as const;

type RideTheBusAction =
  | { type: "guess"; value: string }
  | { type: "nextQuestion" }
  | { type: "nextRound" };

export const rideTheBusPlugin: GamePlugin<RideTheBusState, RideTheBusAction, typeof rideTheBusSettings> = {
  id: "ride-the-bus",
  title: "Ride the Bus",
  category: "cards",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Guess four questions about each dealt card. Wrong answers cost penalty points. Lowest score wins.",
  howToPlay: `Ride the Bus is a classic card-guessing game. Each round you face four progressively harder questions about cards drawn from a shuffled deck.

Round structure: four cards are drawn one at a time. Before each card is revealed, you must answer a question:

Question 1 — Red or Black? Guess the colour of the next card. 50/50 odds.

Question 2 — Higher or Lower? Will the next card be higher or lower in rank than the first card? Ace counts as high (14).

Question 3 — Inside or Outside? Will the next card's rank fall between the first two cards (inside their range) or outside it?

Question 4 — Guess the Suit! Predict the exact suit of the fourth card (♠, ♥, ♦, or ♣). This is the hardest — only a 25% chance.

Penalties: every wrong answer earns one penalty point. After all rounds are complete, your score is calculated as 100 minus your penalty percentage. Perfect play with zero penalties scores 100.

Strategy: pay attention to which cards have already appeared — it shifts the probabilities for later guesses, especially on higher/lower and suit questions.`,
  settings: rideTheBusSettings,
  initialState,
  reducer,
  isTerminal,
  hint: (state: RideTheBusState): HintTarget | null => {
    if (isTerminal(state)) return null;
    return { selector: '[data-testid="hint-target-ride-the-bus-primary"]', pulses: 3 };
  },
  component: RideTheBusGame,
};
