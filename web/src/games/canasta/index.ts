import type { GamePlugin } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { CanastaState } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { Canasta } from "./Canasta.js";

export const canastaSettings = {
  botCount: {
    kind: "number" as const,
    label: "Bots",
    min: 1,
    max: 3,
    step: 1,
    default: 1,
  },
} as const;

type CanastaSettingsRaw = SettingsOf<typeof canastaSettings>;

type CanastaAction =
  | { type: "draw-stock" }
  | { type: "draw-discard" }
  | { type: "meld"; cardIds: string[] }
  | { type: "layoff"; cardId: string; meldId: string }
  | { type: "discard"; cardId: string }
  | { type: "go-out"; cardId: string };

export const canastaPlugin: GamePlugin<CanastaState, CanastaAction, typeof canastaSettings> = {
  id: "canasta",
  title: "Canasta",
  category: "cards",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Classic meld-and-canasta game. Form 7-card melds for huge bonuses.",
  howToPlay: `Canasta is a rummy-style game played with 2 decks plus 4 jokers (108 cards total). The goal is to form melds — sets of 3 or more cards of the same rank — and accumulate points.

Setup: Each player is dealt 11 cards. One card is flipped to start the discard pile; the rest form the stock.

On your turn: Draw from the stock or take the top discard card. Then you may meld cards from your hand onto the table. Finally, discard one card to end your turn.

Melds: Groups of 3+ cards of the same rank (no runs in standard Canasta). Wild cards (2s and Jokers, worth 20 pts each) may be added, but wilds cannot outnumber naturals and a meld may have at most 3 wilds. Rank-3 cards cannot be melded.

First meld threshold: Your first meld must meet a minimum point value based on your current score (50 pts at game start, rising as your score grows).

Canasta: A meld of 7 or more cards earns a bonus — 500 for a natural (no wilds), 300 for a mixed. You must have at least one Canasta before going out.

Going out: Discard your last card (after forming a Canasta) to go out and earn a 100-point bonus.

Controls: Draw from stock or click discard pile. Click cards to select, then Meld or Lay Off onto existing melds. Click Discard to end your turn.`,
  settings: canastaSettings,
  initialState: (seed: number, s: CanastaSettingsRaw) => initialState(seed, s),
  reducer,
  isTerminal,
  component: Canasta,
};
