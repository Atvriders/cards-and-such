import type { GamePlugin } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { ScopaState } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { Scopa } from "./Scopa.js";

export const scopaSettings = {} as const;
type ScopaSettings = SettingsOf<typeof scopaSettings>;

type ScopaAction =
  | { type: "select"; cardId: string }
  | { type: "capture"; tableCardIds: string[] }
  | { type: "place" };

export const scopaPlugin: GamePlugin<ScopaState, ScopaAction, typeof scopaSettings> = {
  id: "scopa",
  title: "Scopa",
  category: "cards",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Italian fishing card game. Capture table cards by matching values to score points.",
  howToPlay: `Scopa (meaning "broom" in Italian) is a classic Italian fishing card game played with a 40-card deck.

Setup: Three cards are dealt to each player and four cards are placed face-up on the table.

Your turn: Select a card from your hand, then either capture or place it.
- Capture: Your card's face value must exactly equal one table card's value, OR the sum of multiple table cards. You take all those cards (plus your played card) into your capture pile.
- Place: If you cannot or choose not to capture, place your card on the table.

Scopa! If your capture clears the entire table, you score a bonus "scopa" point.

When hands are empty, three more cards are dealt to each player. Continue until the deck is exhausted.

Scoring (1 point each):
- Most cards captured overall
- Most coins (♦ diamonds) in captures
- The 7 of coins (♦7, called "settebello")
- Prime: highest "prime value" per suit (7=21, 6=18, A=16, 5=15, 4=14, 3=13, 2=12, face=10)

Plus 1 point per scopa scored during play.

Strategy: Prioritize capturing the settebello and coins cards. Avoid building up the table when the opponent can sweep it for a scopa.`,
  settings: scopaSettings,
  initialState: (seed: number, _settings: ScopaSettings) => initialState(seed),
  reducer,
  isTerminal,
  component: Scopa,
};
