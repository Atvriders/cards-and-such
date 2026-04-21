import type { GamePlugin } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { BaccaratState, BaccaratAction } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { Baccarat } from "./Baccarat.js";

export const baccaratSettings = {
  deckCount: {
    kind: "enum" as const,
    label: "Number of Decks",
    options: ["6", "8"] as const,
    default: "8",
  },
  betSize: {
    kind: "enum" as const,
    label: "Bet per Hand",
    options: ["10", "25", "50", "100"] as const,
    default: "25",
  },
  hands: {
    kind: "enum" as const,
    label: "Hands per Session",
    options: ["10", "20", "50"] as const,
    default: "20",
  },
} as const;

type BaccaratSettingsType = SettingsOf<typeof baccaratSettings>;

export const baccaratPlugin: GamePlugin<BaccaratState, BaccaratAction, typeof baccaratSettings> = {
  id: "baccarat",
  title: "Baccarat",
  category: "cards",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Bet on Player, Banker, or Tie. Closest to 9 wins.",
  howToPlay: `Baccarat (Punto Banco) is one of the simplest casino card games. Your only decision is which side to bet on: Player, Banker, or Tie — then the cards do the rest.

Card values: Ace = 1, cards 2–9 = face value, and 10, Jack, Queen, King all = 0. Each hand's total is the sum of its cards mod 10. So 7 + 8 = 15 → hand value is 5.

Dealing: Two cards go to Player, two to Banker. If either side has 8 or 9 (a "natural"), no more cards are drawn. Otherwise, Player draws a third card if their total is 5 or less. Banker also draws a third card if their total is 5 or less.

Payouts: Player win pays 1:1. Banker win pays 1:1 minus a 5% commission (so net 0.95:1). Tie pays 8:1 — but if you bet Player or Banker and there's a tie, your bet is returned.

Strategy: Banker is the statistically best bet due to slightly better odds (even after the commission). Tie has a very high house edge and should be avoided by serious players.

Settings: Choose the number of decks (6 or 8), your bet size per hand, and how many hands per session. Score equals your final bankroll.`,
  settings: baccaratSettings,
  initialState: (seed: number, settings: BaccaratSettingsType) => initialState(seed, settings),
  reducer,
  isTerminal,
  component: Baccarat,
};
