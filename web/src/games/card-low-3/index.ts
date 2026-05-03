import { lazy } from "react";
import type * as React from "react";
import type { GamePlugin } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { CardLow3State, CardLow3Action } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
const CardLow3 = /* @__PURE__ */ lazy(() => import("./Game.js").then((mod) => ({ default: mod.CardLow3 as unknown as React.ComponentType<unknown> })));
export const cardLow3Settings = {
  rounds: { kind: "enum" as const, label: "Rounds", options: ["10", "20"] as const, default: "10" as const },
} as const;

type S = SettingsOf<typeof cardLow3Settings>;

export const cardLow3Plugin: GamePlugin<CardLow3State, CardLow3Action, typeof cardLow3Settings> = {
  id: "card-low-3",
  title: "Card Low 3",
  category: "cards",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Draw 3 cards — the lower the combined value, the more points you earn.",
  howToPlay: `Card Low 3 is a simple card game where you draw three cards and score based on how low their combined value is. Face cards (J, Q, K) count as 10; Aces as 11; number cards at face value.

Each round press Deal to draw three cards. Your score depends on the total:
- Sum 9 or less: 20 points (excellent low hand)
- Sum 10 to 15: 10 points (good low hand)
- Sum 16 to 21: 5 points (decent low hand)
- Sum 22 or more: 0 points

There is no decision — the luck of the draw determines your hand. The goal is to accumulate points over 10 or 20 rounds.

Press Next after each hand to continue. Your cumulative score is shown at the top. High variance rounds are part of the fun — a run of low cards can give you a massive score burst.

Tips: A maximum possible score requires three 2s (sum = 6). Getting below 10 consistently is rare and exciting. Hands in the 16–21 range are the most common and give 5 points each — expect these to make up most of your score in an average run.`,
  settings: cardLow3Settings,
  initialState: (seed: number, settings: S) => initialState(seed, settings),
  reducer,
  isTerminal,
  hint: (state) => isTerminal(state) ? null : ({ selector: '[data-testid="hint-target-card-low-3-primary"]', pulses: 3 }),
  component: CardLow3,
};
