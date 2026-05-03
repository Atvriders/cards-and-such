import { lazy } from "react";
import type * as React from "react";
import type { GamePlugin } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { CardStackFlipState, CardStackFlipAction, CardStackFlipSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
const CardStackFlipGame = /* @__PURE__ */ lazy(() => import("./Game.js").then((mod) => ({ default: mod.CardStackFlipGame as unknown as React.ComponentType<unknown> })));
const settings = { rounds: { kind:"enum" as const, label:"Rounds", options:["10","20"] as const, default:"10" as const } } as const;
type S = SettingsOf<typeof settings>;
export const cardStackFlipPlugin: GamePlugin<CardStackFlipState, CardStackFlipAction, typeof settings> = {
  id: "card-stack-flip", title: "Card Stack Flip", category: "cards",
  players: { min:1, max:1, multiplayer:false },
  description: "Flip 5 cards each round and score the sum of all their ranks.",
  howToPlay: `Card Stack Flip reveals five cards per round. Your score for each round is the sum of all five card ranks — Aces worth 14, Kings 13, down to 2s. No decisions required; just flip and accumulate. Over 10 or 20 rounds you build a high total score. Great hands with multiple face cards and Aces push the total up fast. How high can you stack your score?`,
  settings,
  initialState: (seed:number, s:S) => initialState(seed, s as CardStackFlipSettings),
  reducer, isTerminal, hint: (state) => isTerminal(state) ? null : ({ selector: '[data-testid="hint-target-card-stack-flip-primary"]', pulses: 3 }), component: CardStackFlipGame,
};
