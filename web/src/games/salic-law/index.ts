import type { GamePlugin } from "../../platform/game-plugin/types.js";
import type { SalicLawState, SalicLawAction } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { SalicLaw } from "./SalicLaw.js";

export const salicLawPlugin: GamePlugin<SalicLawState, SalicLawAction, Record<string, never>> = {
  id: "salic-law",
  title: "Salic Law",
  category: "solitaire",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Two-deck patience where Kings anchor columns but never reach the foundation — only Ace through Queen.",
  howToPlay: `Salic Law is a two-deck patience game inspired by the historical legal doctrine that excluded women (Queens) from succession — here adapted so Kings are excluded from the foundation entirely.

Setup: Two decks are shuffled. Eight Kings are pulled out as permanent anchors for eight tableau columns. Four Aces are set as foundation starters. The remaining cards fill the eight columns (11 cards each) and a stock.

Foundations: Four piles building from Ace to Queen (rank 12) by suit — Kings are excluded. Build each foundation up in the same suit: A, 2, 3 … 10, J, Q. Win when all four foundations are complete (12 cards each).

Tableau: Eight columns, each anchored by a King (immovable). On top of the King and any exposed card, you may place a card exactly one rank lower (any suit). Only the top card of each column is playable.

Stock & Waste: Draw from the stock one card at a time. The waste top may be played to any legal column or foundation position.

Scoring: +5 per card sent to a foundation. Maximum 240 (48 non-King, non-Ace cards go to foundations plus the 4 Aces placed at start).

Tips: Expose your non-Ace low cards quickly to start foundation sequences. The eight King columns provide wide surface area — use them wisely.`,
  settings: {} as const,
  initialState: (seed: number) => initialState(seed),
  reducer,
  isTerminal,
  hint: (state) => isTerminal(state) ? null : { selector: '[data-testid="play-restart-btn"]', pulses: 3 },
  component: SalicLaw,
};
