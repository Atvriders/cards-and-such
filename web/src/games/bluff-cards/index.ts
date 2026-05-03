import { lazy } from "react";
import type * as React from "react";
import type { GamePlugin, HintTarget } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { BluffCardsState, BluffCardsAction, BluffCardsSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
const BluffCardsGame = /* @__PURE__ */ lazy(() => import("./Game.js").then((mod) => ({ default: mod.BluffCardsGame as unknown as React.ComponentType<unknown> })));
const settings = { dummy: { kind: "boolean" as const, label: "dummy", default: false } } as const;
type S = SettingsOf<typeof settings>;
export const bluffCardsPlugin: GamePlugin<BluffCardsState, BluffCardsAction, typeof settings> = {
  id: "bluff-cards", title: "Bluff (Cards)", category: "cards",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Cheat with sequence constraints: high cards win bigger.",
  howToPlay: "Bluff is a bluff-rank game in the Cheat family with strict sequence rules — each player must claim a rank one greater than the previous. This mini version condenses it into a high-stakes 8-round reveal contest.\n\nEach round, you and the CPU each \"stake\" a card from a 52-deck. Higher rank wins. Aces (13) high, twos (1) low.\n\nScoring: round win awards 14 points (the highest among bluff-family games — Bluff plays for bigger pots). Tie awards 5 sympathy points. Loss awards zero.\n\nEight rounds total. Expected total: 55-75 points; lucky games cross 90.\n\nReal Bluff has players passing escalating claims around the table, and the constraint that each play must match-or-exceed the prior bluff makes the bluff's failure more costly. This mini distills that to per-round high-stakes reveals where every round matters. The bigger payoff per win means a hot streak feels more rewarding — and a cold streak hurts more. Pure variance, no negotiations.",
  settings,
  initialState: (seed: number, s: S) => initialState(seed, s as BluffCardsSettings),
  reducer, isTerminal, hint: (state: BluffCardsState): HintTarget | null => (state.phase === "ready" ? { selector: '[data-testid="hint-target-bluff-cards-primary"]', pulses: 3 } : null), component: BluffCardsGame,
};
