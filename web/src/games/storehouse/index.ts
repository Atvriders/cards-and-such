import type { GamePlugin } from "../../platform/game-plugin/types.js";
import type { StorehouseState, StorehouseAction } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { Storehouse } from "./Game.js";

export const storehousePlugin: GamePlugin<StorehouseState, StorehouseAction, Record<string, never>> = {
  id: "storehouse",
  title: "Storehouse",
  category: "solitaire",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Four tableau columns built down same-suit, with four reserve cells holding three cards each.",
  howToPlay: `Storehouse deals 52 cards across four areas. The four tableau columns each hold ten face-up cards. The four reserve cells (top left) each start with three cards — any card in a reserve cell is available for play. Build the four foundations up from Ace to King by suit.

Tableau: Stack cards in descending order within the same suit. Only a properly sequenced same-suit run may be moved as a group; the number you can move depends on available empty cells and empty columns. An empty tableau column accepts any card or valid sequence.

Cells: Each reserve cell holds one or more cards, but only the top card is playable. Unlike FreeCell, cells don't start empty — you must work down through the reserve stack.

Goal: Move all 52 cards to the foundations, building each suit from Ace up to King.

Strategy: Prioritize uncovering Aces buried in reserve cells. Because the tableau builds in same-suit only, you need good suit management — don't pile cards of different suits on top of each other. Plan your moves to keep at least one empty cell available as a buffer. Empty tableau columns are extremely powerful, so work to free them early.`,
  settings: {} as const,
  initialState: (seed: number) => initialState(seed),
  reducer,
  isTerminal,
  component: Storehouse,
} as unknown as GamePlugin;
