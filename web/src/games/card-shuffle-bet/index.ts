import { lazy } from "react";
import type * as React from "react";
import type { GamePlugin } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { CardShuffleBetState, CardShuffleBetAction, CardShuffleBetSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
const CardShuffleBet = /* @__PURE__ */ lazy(() => import("./Game.js").then((mod) => ({ default: mod.CardShuffleBet as unknown as React.ComponentType<unknown> })));
const cardShuffleBetSettings = {
  rounds: { kind: "enum" as const, label: "Rounds", options: ["6", "8", "10"] as const, default: "8" as const },
} as const;

type S = SettingsOf<typeof cardShuffleBetSettings>;

export const cardShuffleBetPlugin: GamePlugin<CardShuffleBetState, CardShuffleBetAction, typeof cardShuffleBetSettings> = {
  id: "card-shuffle-bet",
  title: "Card Shuffle Bet",
  category: "cards",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Three cards are shown face-up. Memorize the highest, then cards shuffle face-down — pick where the top card landed!",
  howToPlay: `Card Shuffle Bet is a memory challenge. Three cards are laid face-up so you can see all their ranks. Identify which card is the highest-ranked. Then click Shuffle and the cards are randomized into new positions, all now facing down.

Your task: click the position where you believe the highest-ranked card is now hidden. A correct pick earns 40 points. An incorrect pick earns nothing.

The shuffling always randomizes all three positions, so even if you spot the highest card perfectly you must track it through the rearrangement. Quick eyes and sharp memory are rewarded!

After the result is shown, press Next to see three fresh cards and start again.

Use Settings to choose 6, 8, or 10 rounds. Your final score is displayed at the end. Perfect recall scores a maximum of 400 points!`,
  settings: cardShuffleBetSettings,
  initialState: (seed: number, s: S) => initialState(seed, s as CardShuffleBetSettings),
  reducer, isTerminal,
  hint: (state: any) => {
    if (state.phase === "gameover") return null;
    if (state.phase === "memorize") return { selector: '[data-testid="hint-target-card-shuffle-bet-ready"]', pulses: 3 };
    if (state.phase === "result") return { selector: '[data-testid="hint-target-card-shuffle-bet-next"]', pulses: 3 };
    return null;
  }, component: CardShuffleBet,
};
