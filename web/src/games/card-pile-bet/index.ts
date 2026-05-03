import { lazy } from "react";
import type * as React from "react";
import type { GamePlugin, HintTarget } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { CardPileBetState, CardPileBetAction, CardPileBetSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
const CardPileBet = /* @__PURE__ */ lazy(() => import("./Game.js").then((mod) => ({ default: mod.CardPileBet as unknown as React.ComponentType<unknown> })));
const cardPileBetSettings = {
  rounds: { kind: "enum" as const, label: "Rounds", options: ["8", "12", "16"] as const, default: "12" as const },
} as const;

type S = SettingsOf<typeof cardPileBetSettings>;

export const cardPileBetPlugin: GamePlugin<CardPileBetState, CardPileBetAction, typeof cardPileBetSettings> = {
  id: "card-pile-bet",
  title: "Card Pile Bet",
  category: "cards",
  players: { min: 1, max: 1, multiplayer: false },
  description: "See the top card and bet on whether the next card in the pile is red or black. Correct guesses earn 20 points; wrong ones cost 10.",
  howToPlay: `Card Pile Bet is a fast color-prediction game. A shuffled deck is laid face-down as a pile. Each round the top card is revealed and you must predict whether the NEXT card in the pile is red (Hearts or Diamonds) or black (Spades or Clubs).

A correct color prediction earns you 20 points. An incorrect prediction deducts 10 points (score cannot go below zero). The odds are close to 50/50 each round, though savvy players can use card counting to improve their edge as rounds progress.

Click Red or Black to place your bet. The next card is then flipped to reveal whether you were right. Press Next to continue to the next prediction.

Use Settings to choose 8, 12, or 16 rounds. Final score is shown at the end. A lucky or skillful run of correct calls can rack up a high score!`,
  settings: cardPileBetSettings,
  initialState: (seed: number, s: S) => initialState(seed, s as CardPileBetSettings),
  reducer, isTerminal, hint: (state: CardPileBetState): HintTarget | null => ((state.phase === "betting" || state.phase === "reveal" || state.phase === "result") ? { selector: ".bet-btn", pulses: 3 } : null), component: CardPileBet,
};
