import { lazy } from "react";
import type * as React from "react";
import type { GamePlugin } from "../../platform/game-plugin/types.js";
import { initialState, reducer, isTerminal } from "./state.js";
import type { NestorState, NestorAction, NestorSettings } from "./state.js";
const Nestor = /* @__PURE__ */ lazy(() => import("./Nestor.js").then((mod) => ({ default: mod.Nestor as unknown as React.ComponentType<unknown> })));
const settings = {} as const;

export const nestorPlugin: GamePlugin<NestorState, NestorAction, typeof settings> = {
  id: "nestor",
  title: "Nestor",
  category: "solitaire",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Match same-rank pairs from column tops and a reserve to clear all 52 cards.",
  howToPlay: `Nestor is a matching solitaire played with a single standard deck. The deck is dealt into 8 face-up columns of 6 cards each (48 cards total), with a special constraint: no column may have two cards of the same rank in the original deal. The remaining 4 cards form a face-up reserve.

Goal: remove all 52 cards by matching pairs of equal rank.

On each turn, click any top card of a column (or a reserve card) to select it. Then click another top card or reserve card of the same rank to remove the pair. Both cards are discarded. If you click a different rank, the selection shifts to that card instead.

Only the top card of each column is available at any time — the cards beneath become accessible as cards above are removed. Reserve cards are always available.

The game ends when no matching pair of same-rank cards exists among the exposed tops. With the no-duplicate-per-column deal, Nestor has a fair win rate, but poor choices can still block you. Look ahead: exposing a buried rank may create the match you need.

Win by removing all 26 pairs (all 52 cards).`,
  settings,
  initialState: (seed: number, _settings: NestorSettings) => initialState(seed, _settings),
  reducer,
  isTerminal,
  hint: (state) => isTerminal(state) ? null : { selector: '[data-testid="play-restart-btn"]', pulses: 3 },
  component: Nestor,
};
