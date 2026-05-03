import { lazy } from "react";
import type * as React from "react";
import type { GamePlugin } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { CardLowHigh3State, CardLowHigh3Action, CardLowHigh3Settings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
const CardLowHigh3 = /* @__PURE__ */ lazy(() => import("./Game.js").then((mod) => ({ default: mod.CardLowHigh3 as unknown as React.ComponentType<unknown> })));
const cardLowHigh3Settings = {
  rounds: { kind: "enum" as const, label: "Rounds", options: ["8", "10", "12"] as const, default: "10" as const },
} as const;

type S = SettingsOf<typeof cardLowHigh3Settings>;

export const cardLowHigh3Plugin: GamePlugin<CardLowHigh3State, CardLowHigh3Action, typeof cardLowHigh3Settings> = {
  id: "card-low-high-3",
  title: "Card Low High 3",
  category: "cards",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Three cards are dealt face-up. Pick one and call it the Lowest or Highest ranked card in the trio — right call earns 30 points!",
  howToPlay: `Card Low High 3 is a prediction game with three face-up cards. Three cards from a standard deck are dealt and shown. You must choose one of the cards and declare it either the LOWEST or HIGHEST ranked card among the three.

A correct call earns 30 points. An incorrect call earns nothing. Cards are ranked 2 through Ace — a 2 is the lowest possible and an Ace is the highest.

Strategy matters: if you see three mid-range cards, calling the outlier low or high is a strong move. If all three cards cluster closely in rank, any call is more of a guess.

After the result is shown, the actual lowest card is highlighted in green and the highest in red. Press Next to move to the next round with a fresh deal.

Use Settings to choose 8, 10, or 12 rounds. Final score is shown at the end. Can you read three cards and call it perfectly every time?`,
  settings: cardLowHigh3Settings,
  initialState: (seed: number, s: S) => initialState(seed, s as CardLowHigh3Settings),
  reducer, isTerminal,
  hint: (state: any) => {
    if (state.phase === "gameover") return null;
    if (state.phase === "result") return { selector: '[data-testid="hint-target-card-low-high-3-next"]', pulses: 3 };
    return null;
  }, component: CardLowHigh3,
};
