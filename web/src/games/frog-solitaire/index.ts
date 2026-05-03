import { lazy } from "react";
import type * as React from "react";
import type { GamePlugin } from "../../platform/game-plugin/types.js";
import type { FrogSolitaireState, FrogSolitaireAction } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
const FrogSolitaire = /* @__PURE__ */ lazy(() => import("./FrogSolitaire.js").then((mod) => ({ default: mod.FrogSolitaire as unknown as React.ComponentType<unknown> })));
export const frogSolitairePlugin: GamePlugin<FrogSolitaireState, FrogSolitaireAction, Record<string, never>> = {
  id: "frog-solitaire",
  title: "Frog",
  category: "solitaire",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Two-deck patience: build 8 rank-sequence foundations regardless of suit.",
  howToPlay: `Frog (also called The Frog) is a two-deck patience game where suits are irrelevant — only card rank matters on the foundations.

Setup: Two standard decks (104 cards) are shuffled. One Ace is automatically placed on the first of eight foundation piles. Thirteen cards are dealt face-up to the Reserve. The remaining cards form the Stock.

Foundations: All 8 foundations build upward from Ace to King by rank only — any suit is welcome. Each foundation needs exactly 13 cards ranked Ace through King.

Reserve: A face-up stack of 13 cards; only the top card is available for play. Once played, the card beneath becomes accessible.

Stock & Waste: Click the stock to flip the next card face-up onto the Waste pile. If that card fits any foundation, it is placed automatically. Otherwise it sits on the Waste. You may click the Waste top to send it to a foundation manually.

No passes: You get only one pass through the stock.

Scoring: +1 point per card placed on a foundation. Target: 104.

Tips: Sequence runs on the foundations are rank-only, so any suit can continue any foundation. Prioritize clearing the Reserve to free up cards. Time stock draws to fill gaps in the foundation sequences.`,
  settings: {} as const,
  initialState: (seed: number) => initialState(seed),
  reducer,
  isTerminal,
  hint: (state) => isTerminal(state) ? null : { selector: '[data-testid="play-restart-btn"]', pulses: 3 },
  component: FrogSolitaire,
};
