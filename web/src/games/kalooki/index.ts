import type { GamePlugin } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { KalookiState } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { Kalooki } from "./Kalooki.js";

export const kalookiSettings = {
  botCount: {
    kind: "number" as const,
    label: "Bots",
    min: 1,
    max: 3,
    step: 1,
    default: 1,
  },
} as const;

type KalookiSettingsRaw = SettingsOf<typeof kalookiSettings>;
type KalookiAction =
  | { type: "draw-stock" }
  | { type: "draw-discard" }
  | { type: "meld"; cardIds: string[] }
  | { type: "layoff"; cardId: string; meldId: string }
  | { type: "discard"; cardId: string }
  | { type: "kalooki" };

export const kalookiPlugin: GamePlugin<KalookiState, KalookiAction, typeof kalookiSettings> = {
  id: "kalooki",
  title: "Kalooki (Kaluki)",
  category: "cards",
  players: { min: 1, max: 1, multiplayer: false },
  description: "13-card rummy with a Kalooki bonus for going out without prior melding.",
  howToPlay: `Kalooki (also spelled Kaluki) is a 13-card rummy variant popular in Jamaica and the Caribbean. It is played with 2 standard decks plus 4 Jokers (108 cards), and each player receives 13 cards.

Setup: Each player is dealt 13 cards. One card starts the discard pile; the rest form the stock.

On your turn: Draw one card from the stock or take the top discard. You may then meld sets (3 or more same-rank cards — wilds may substitute, but wilds must not outnumber naturals) or runs (3 or more consecutive same-suit cards, with wilds filling gaps). You may also lay off individual cards onto existing table melds. Finally, discard one card to end your turn.

Wild cards: 2s and Jokers are wild. Wild cards carry a heavy penalty (25 points each) if left in hand at game end.

Going out: Reduce your hand to zero cards by melding and discarding. When you go out, opponents score penalty points for cards remaining in their hands.

Kalooki bonus: If you go out without having melded any cards previously this hand — playing all your cards in one dramatic turn — you earn the Kalooki bonus (minus 50 penalty points) for exceptional play.

Controls: Draw from stock or click discard. Select cards and click Meld to place groups, or select a single card and click Lay Off on a table meld. Click Discard to end your turn.`,
  settings: kalookiSettings,
  initialState: (seed: number, s: KalookiSettingsRaw) => initialState(seed, s),
  reducer,
  isTerminal,
  component: Kalooki,
};
