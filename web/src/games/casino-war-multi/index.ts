import type { GamePlugin } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { CasinoWarMultiState, CasinoWarMultiAction } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { CasinoWarMulti } from "./Game.js";

export const casinoWarMultiSettings = {
  handsPerSession: {
    kind: "number" as const,
    label: "Rounds per Session",
    min: 5, max: 50, step: 5, default: 15,
  },
  antePerHand: {
    kind: "enum" as const,
    label: "Ante Per Hand",
    options: ["5", "10", "25"] as const,
    default: "10",
  },
  numHands: {
    kind: "enum" as const,
    label: "Number of Hands",
    options: ["2", "3", "5"] as const,
    default: "3",
  },
} as const;

type CasinoWarMultiSettingsType = SettingsOf<typeof casinoWarMultiSettings>;

export const casinoWarMultiPlugin: GamePlugin<CasinoWarMultiState, CasinoWarMultiAction, typeof casinoWarMultiSettings> = {
  id: "casino-war-multi",
  title: "Casino War Multi-Hand",
  category: "cards",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Play Casino War on 2, 3, or 5 hands simultaneously.",
  howToPlay: `Casino War Multi-Hand plays Casino War across multiple simultaneous hands — 2, 3, or 5 at once. Each hand is independent: you vs. the dealer card for card.

Rules per hand: Both player and dealer receive one card. High card wins. Aces are highest. Win = collect 1:1 on ante. Lose = forfeit ante.

Ties: When any hand ties you choose: Go to War (match the ante on tied hands, burn 3 cards, deal one more each — win if your card matches or beats dealer's, lose both bets if not) or Surrender (forfeit half the tied ante).

Multi-hand action: All ties are resolved together — one decision covers all tied hands at once.

Strategy: With multiple hands running simultaneously, swings are larger. Go to War is generally better than surrendering when you're close to even — the expected cost of surrendering (half ante loss) vs. the war's break-even odds makes war slightly preferable.

Your score equals your final bankroll at session end.`,
  settings: casinoWarMultiSettings,
  initialState: (seed: number, settings: CasinoWarMultiSettingsType) => initialState(seed, settings),
  reducer,
  isTerminal,
  component: CasinoWarMulti,
};
