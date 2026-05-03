import { lazy } from "react";
import type * as React from "react";
import type { GamePlugin } from "../../platform/game-plugin/types.js";
import type { IntelligenceState, IntelligenceAction, IntelligenceSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
const Intelligence = /* @__PURE__ */ lazy(() => import("./Intelligence.js").then((mod) => ({ default: mod.Intelligence as unknown as React.ComponentType<unknown> })));
export const intelligenceSettings = {} as const;

export const intelligencePlugin: GamePlugin<IntelligenceState, IntelligenceAction, typeof intelligenceSettings> = {
  id: "intelligence",
  title: "Intelligence",
  category: "solitaire",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Two-deck fan solitaire — build eight foundations A to K by suit from fans of three.",
  howToPlay: `Intelligence is a two-deck fan solitaire played with 104 cards. All cards are dealt face-up into fans of three, with any remaining cards becoming spare single cards set aside.

Goal: build all eight foundation piles (two per suit) from Ace up to King, one suit per pile.

Play: only the top card of each fan is available. Click a fan's top card to select it, then click a foundation to place it there if it is the correct next card in sequence. You may also move a fan top card onto another fan if it is one rank lower (any suit) — this is how you uncover buried cards.

If a fan becomes empty, you may fill it with a spare card to bring it back into play. Spare cards may also be played directly to foundations.

There is no stock or draw mechanic — all cards are visible from the start. This makes Intelligence a game of pure analysis: every decision can be evaluated in advance, but the sheer number of fans means planning ahead is essential.

Tips: prioritize uncovering Aces and low cards. Use empty fan slots wisely — they are precious for repositioning sequences. Chain multiple fan-to-fan moves to unblock a buried card that is just one rank away from your foundation.`,
  settings: intelligenceSettings,
  initialState: (seed: number) => initialState(seed, {} as IntelligenceSettings),
  reducer,
  isTerminal,
  hint: (state) => isTerminal(state) ? null : { selector: '[data-testid="play-restart-btn"]', pulses: 3 },
  component: Intelligence,
};
