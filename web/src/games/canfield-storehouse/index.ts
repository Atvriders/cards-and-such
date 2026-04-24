import type { GamePlugin } from "../../platform/game-plugin/types.js";
import type { CanfieldStorehouseState, CanfieldStorehouseAction } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { CanfieldStorehouse } from "./CanfieldStorehouse.js";

export const canfieldStorehouseSettings = {} as const;

export const canfieldStorehousePlugin: GamePlugin<CanfieldStorehouseState, CanfieldStorehouseAction, typeof canfieldStorehouseSettings> = {
  id: "canfield-storehouse",
  title: "Canfield Storehouse",
  category: "solitaire",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Canfield variant with 2s on foundations and a 13-card open storehouse reserve.",
  howToPlay: `Canfield Storehouse is a variant of Canfield in which the four 2s are placed on the foundations at the start, and the reserve is an open "storehouse" of 13 face-up cards you can always see and access.

Deal: The four 2s go directly to the four foundation piles. Thirteen cards are laid face-up in a row as the storehouse — every card in it is accessible. Four tableau columns receive one card each. The remaining cards form the stock (draw three at a time).

Foundations build up by suit in sequence 2-3-4-5-6-7-8-9-10-J-Q-K-A, wrapping around so Ace follows King.

Tableau columns build down in alternating colors, same as classic Canfield. Any card or legal sequence may be moved to an empty column.

Moves: Cards from the waste pile, any storehouse slot, or tableau tops may be played onto foundations or other tableau columns. Draw three cards at a time from the stock; redeal as needed.

Strategy: Tap the storehouse early — it's your most flexible resource. Try to build sequences that expose low cards in the same suit as your foundation piles.

Win condition: All 52 cards moved to the foundations.`,
  settings: canfieldStorehouseSettings,
  initialState: (seed: number) => initialState(seed),
  reducer,
  isTerminal,
  component: CanfieldStorehouse,
};
