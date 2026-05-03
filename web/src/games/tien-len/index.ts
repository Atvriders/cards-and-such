import { lazy } from "react";
import type * as React from "react";
import type { GamePlugin } from "../../platform/game-plugin/types.js";
import type { TienLenState } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
const TienLenGame = /* @__PURE__ */ lazy(() => import("./Game.js").then((mod) => ({ default: mod.TienLenGame as unknown as React.ComponentType<unknown> })));
export const tienLenSettings = {
  dummy: { kind: "enum" as const, label: "Mode", options: ["off"] as const, default: "off" as const },
} as const;

type TienLenAction = { type: "play"; cardIds: string[] } | { type: "pass" };

export const tienLenPlugin: GamePlugin<TienLenState, TienLenAction, typeof tienLenSettings> = {
  id: "tien-len",
  title: "Tien Len",
  category: "cards",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Vietnamese shedding game. Beat the pile with singles, pairs, triples, straights, or four-of-a-kind bombs.",
  howToPlay: `Tien Len (also called Thirteen) is a Vietnamese 4-player shedding game. You play against three bots.

Setup: all 52 cards are dealt — 13 per player. The player holding the 3 of Spades (3♠) leads the first play.

Card ranking: 3 is lowest, rising through 4-5-6-7-8-9-10-J-Q-K-A, with 2 as the highest single rank.

Valid plays: you may play a single card, a pair (two matching ranks), a triple (three matching), a straight (3 or more consecutive ranks — no 2s allowed in straights), or a four-of-a-kind bomb. Each play must match the type of the current pile and beat its highest card.

Bombs: a four-of-a-kind beats any pair or triple of 2s, even though 2 is normally the highest rank. This is the key defensive counter.

Passing: you may pass any time the pile is not empty. When all other players pass, the last player to play leads any new hand type.

Winning: first to empty their hand wins (score 100). Places 2nd through 4th score 60, 30, and 0 respectively.

Controls: click cards to select (they lift), then press Play. Press Pass to skip.`,
  settings: tienLenSettings,
  initialState,
  reducer,
  isTerminal,
  hint: (state: any) => {
      if (state.phase === "playing") return { selector: '[data-testid="hint-target-tien-len-play"]', pulses: 3 };
      return null;
    },
  component: TienLenGame,
};
