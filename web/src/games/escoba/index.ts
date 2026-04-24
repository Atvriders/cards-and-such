import type { GamePlugin } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { EscobaState } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { Game } from "./Game.js";

export const escobaSettings = {} as const;
type EscobaSettings = SettingsOf<typeof escobaSettings>;
type EscobaAction =
  | { type: "select"; cardId: string }
  | { type: "capture"; tableCardIds: string[] }
  | { type: "place" };

export const escobaPlugin: GamePlugin<EscobaState, EscobaAction, typeof escobaSettings> = {
  id: "escoba",
  title: "Escoba",
  category: "cards",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Spanish fishing card game. Capture table cards that sum to 15.",
  howToPlay: `Escoba (meaning "broom" in Spanish) is a classic Spanish fishing card game played with a 40-card Spanish deck. It is similar to the Italian game Scopa, but uses 15 as the magic capture number instead of 11.

Setup: Three cards are dealt to each player and four cards are placed face-up on the table. Face values: Ace=1, 2–7 at face value, Jack=8, Queen=9, King=10.

Your turn: Select a card from your hand, then either capture or place it.
- Capture: Your card's value plus the values of chosen table cards must total exactly 15. You take all those cards into your pile.
- Place: If you cannot or choose not to capture, place your card face-up on the table.

Escoba! If your capture clears the entire table, you score a bonus "Escoba" point.

When hands are empty, three more cards are dealt. Continue until the deck is exhausted.

Scoring (1 point each):
- Escoba bonuses scored during play
- Most cards captured
- Most diamond (♦) cards captured
- The 7 of diamonds

Strategy: Track which cards are on the table and in your hand to set up 15-sum captures. Clearing the table earns a valuable bonus point!`,
  settings: escobaSettings,
  initialState: (seed: number, _settings: EscobaSettings) => initialState(seed),
  reducer,
  isTerminal,
  component: Game,
};
