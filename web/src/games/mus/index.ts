import { lazy } from "react";
import type * as React from "react";
import type { GamePlugin } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { MusState } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
const Mus = /* @__PURE__ */ lazy(() => import("./Mus.js").then((mod) => ({ default: mod.Mus as unknown as React.ComponentType<unknown> })));
export const musSettings = {} as const;
type MusSettings = SettingsOf<typeof musSettings>;
type MusAction = { type: "bid"; amount: number };

export const musPlugin: GamePlugin<MusState, MusAction, typeof musSettings> = {
  id: "mus",
  title: "Mus (Juego)",
  category: "cards",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Basque partnership bidding game. Bid on your Juego (total hand value near 31) to score points.",
  howToPlay: `Mus is a celebrated Basque card game traditionally played in partnerships with spirited bidding and bluffing. This version focuses on the Juego (total hand value) phase with a 40-card Spanish deck.

Setup: Each player (you and 3 bots) is dealt 4 cards from the Spanish deck (Ace through 7, plus Jack, Queen, King — no 8, 9, 10).

Card values for Juego: Ace = 11, King/Queen/Jack = 10, 3 = 10, others = face value.

Juego (31+): If your hand totals 31 or more, you "have Juego." This is a powerful position in real Mus where Juego holders automatically score against non-Juego players.

Bidding: You bid a number representing your confidence in your hand's value. Higher bids indicate you believe your hand is best. Bots bid based on their own hand values.

Scoring rules:
- If any player has Juego (31+), the Juego holder with the highest value (or closest to 31) wins 3 points.
- If nobody has Juego, the player with the highest hand value wins 2 points.
- The highest bidder earns a bonus point if they also win the hand.

Strategy: Bid aggressively when you have Juego (31+), especially if your value is exactly 31 — that traditionally beats all higher values in Mus. Pass (bid 0) with weak hands to avoid tipping off opponents.`,
  settings: musSettings,
  initialState: (seed: number, _settings: MusSettings) => initialState(seed),
  reducer,
  isTerminal,
  hint: (s: any) => { const p = (s as any).phase; if (p === "gameover" || p === "done" || p === "ended" || (s as any).gameOver) return null; return { selector: '[data-testid="hint-target-mus-action"]', pulses: 3 }; },
  component: Mus,
};
