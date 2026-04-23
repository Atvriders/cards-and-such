import type { GamePlugin } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { BastraState } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { Bastra } from "./Bastra.js";

export const bastraSettings = {} as const;

type BastraSettingsType = SettingsOf<typeof bastraSettings>;
type BastraAction =
  | { type: "capture"; handCardId: string; tableCardIds: string[] }
  | { type: "trail"; handCardId: string };

export const bastraPlugin: GamePlugin<BastraState, BastraAction, typeof bastraSettings> = {
  id: "bastra",
  title: "Bastra",
  category: "cards",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Turkish casino game. Capture table cards by matching rank or sum. Score a Bastra for clearing the table!",
  howToPlay: `Bastra is a Turkish card-capturing game for two players using a standard 52-card deck.

Setup: Four cards are dealt face-up to the table. Each player receives four cards in hand. The remaining cards form a stock.

Capturing: On your turn select a card from your hand and choose table cards to capture. You may capture if:
• Your card matches the rank of one or more table cards exactly, OR
• Your card's value equals the sum of multiple numeric table cards (face cards count as 10 for sums; no face cards allowed in sum groups).

Bastra: If you capture ALL remaining table cards in one move that is a Bastra worth 10 bonus points!

Trailing: If you cannot or choose not to capture, trail a card — add it face-up to the table.

Redealing: When both players run out of cards, four more cards are dealt to each from the stock.

End of game: When the stock is exhausted and hands are empty, the player who last captured takes any remaining table cards.

Scoring: Most cards = 3 pts; each Ace = 1 pt; 2 of Clubs = 2 pts; 10 of Diamonds = 3 pts; each Bastra = 10 pts.

Controls: Click a card in your hand to select it, then click table cards for capture, then click "Capture" or "Trail".`,
  settings: bastraSettings,
  initialState: (seed: number, _settings: BastraSettingsType) =>
    initialState(seed, { placeholder: "none" }),
  reducer,
  isTerminal,
  component: Bastra,
};
