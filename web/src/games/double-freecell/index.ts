import type { GamePlugin } from "../../platform/game-plugin/types.js";
import type { DoubleFreeState, DoubleFreeAction } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { DoubleFreeCell } from "./Game.js";

export const doubleFreeCellPlugin: GamePlugin<DoubleFreeState, DoubleFreeAction, Record<string, never>> = {
  id: "double-freecell",
  title: "Double FreeCell",
  category: "solitaire",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Two-deck FreeCell with 10 cascades, 6 free cells, and 8 foundations to fill.",
  howToPlay: `Double FreeCell uses two standard decks shuffled together for 104 cards. Ten tableau cascades are dealt face-up — the first four columns get eleven cards each and the remaining six get ten, leaving nothing in reserve. Six free cells sit above the cascades, and eight foundation piles await.

Foundations: Build each of the eight foundations up from Ace to King by suit. Each foundation holds one complete 13-card suit run. With two decks there are two copies of each suit, so you need to complete all eight (four suits × two runs).

Tableau: Build down in alternating colors (red on black, black on red), one card at a time or in a valid sequence. The maximum sequence you can move at once is (1 + empty free cells) × 2^(empty cascades).

Free Cells: Each of the six free cells holds exactly one card as a temporary parking spot. Use them carefully — with ten large columns they fill up faster than you might expect.

Strategy: Locate all eight Aces early and clear a path to the foundations. Manage both copies of each rank across the two decks. Avoid trapping a needed card beneath a long column you cannot easily rearrange.`,
  settings: {} as const,
  initialState: (seed: number) => initialState(seed),
  reducer,
  isTerminal,
  component: DoubleFreeCell,
} as unknown as GamePlugin;
