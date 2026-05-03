import { lazy } from "react";
import type * as React from "react";
import type { GamePlugin } from "../../platform/game-plugin/types.js";
import type { PusoyDosState } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
const PusoyDosGame = /* @__PURE__ */ lazy(() => import("./Game.js").then((mod) => ({ default: mod.PusoyDosGame as unknown as React.ComponentType<unknown> })));
export const pusoyDosSettings = {
  dummy: { kind: "enum" as const, label: "Mode", options: ["off"] as const, default: "off" as const },
} as const;

type PusoyDosAction = { type: "play"; cardIds: string[] } | { type: "pass" };

export const pusoyDosPlugin: GamePlugin<PusoyDosState, PusoyDosAction, typeof pusoyDosSettings> = {
  id: "pusoy-dos",
  title: "Pusoy Dos",
  category: "cards",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Philippine shedding game. Beat the pile — winner earns points based on opponents' remaining cards.",
  howToPlay: `Pusoy Dos is the Philippine variant of the Big Two family. You play against three bots.

Setup: all 52 cards are dealt — 13 per player. The holder of 3♦ must lead first.

Card ranking: 3 is lowest, rising through 4…K, Ace, and 2 as the absolute highest. Suit breaks ties: ♦ < ♣ < ♥ < ♠.

Legal plays: singles, pairs, triples, or 5-card poker hands (straight, flush, full house, four-of-a-kind, straight flush). Each play must match the current pile type and be strictly higher.

Scoring twist: when the round ends, the winner earns points equal to the sum of card values still held by the losers. Low cards are worth 1–7 points, face cards 10, Kings 13, Aces 14, and 2s 15 each.

Strategy: save high cards (Aces and 2s) to break opponent momentum. Playing 2s wastefully early is a common mistake — they are hard to replace.

Passing: you may pass any play you cannot beat. When all others pass, the last player to play leads a fresh hand.

Controls: click cards to select, then press Play. Press Pass to skip your turn.`,
  settings: pusoyDosSettings,
  initialState,
  reducer,
  isTerminal,
  hint: (state: any) => {
      if (state.phase === "playing") return { selector: '[data-testid="hint-target-pusoy-dos-play"]', pulses: 3 };
      return null;
    },
  component: PusoyDosGame,
};
