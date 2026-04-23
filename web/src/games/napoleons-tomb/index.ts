import type { GamePlugin } from "../../platform/game-plugin/types.js";
import type { NapoleonsTombState, NapoleonsTombAction, NapoleonsTombSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { NapoleonsTombGame } from "./Game.js";

export const napoleonsTombSettings = {
  dummy: { kind: "boolean" as const, label: "Standard Rules", default: true },
} as const;

export const napoleonsTombPlugin: GamePlugin<NapoleonsTombState, NapoleonsTombAction, typeof napoleonsTombSettings> = {
  id: "napoleons-tomb",
  title: "Napoleon's Tomb",
  category: "solitaire",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Build four suit foundations from Ace to King using a 3×3 center grid as a staging area.",
  howToPlay: `Napoleon's Tomb is a classic solitaire game using one standard deck of 52 cards. The goal is to build all four suit foundations from Ace up to King.

The layout has three areas: a 3×3 center grid (9 cells), four corner foundations (one per suit), and the draw deck. Cards are dealt one at a time from the deck.

When a new card appears in the Current Card display, you choose where to place it:
- Click an empty grid cell to park it there temporarily.
- Click a foundation to place it directly there (only valid if it continues that suit's sequence — foundations start with Ace and build up through 2, 3, …, King).

Grid cards can also be moved to foundations — click an occupied grid cell to send that card to its foundation if the sequence allows.

Strategy is key: use the grid as a buffer for cards that are not yet playable to foundations. Plan which cells to occupy so you do not get stuck. The game ends when all 52 cards reach the foundations (you win) or when no valid placements remain (you lose).`,
  settings: napoleonsTombSettings,
  initialState: (seed, settings) => initialState(seed, settings),
  reducer,
  isTerminal,
  component: NapoleonsTombGame,
};
