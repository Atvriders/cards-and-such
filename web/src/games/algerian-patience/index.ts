import type { GamePlugin } from "../../platform/game-plugin/types.js";
import type { AlgerianPatienceState, AlgerianPatienceAction, AlgerianPatienceSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { AlgerianPatience } from "./AlgerianPatience.js";

export const algerianPatienceSettings = {} as const;

export const algerianPatiencePlugin: GamePlugin<AlgerianPatienceState, AlgerianPatienceAction, typeof algerianPatienceSettings> = {
  id: "algerian-patience",
  title: "Algerian Patience",
  category: "solitaire",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Two-deck solitaire with 8 foundations — four build up A to K, four build down K to A, all by suit.",
  howToPlay: `Algerian Patience is a challenging two-deck (104-card) solitaire distinguished by its dual foundation system. You must fill eight foundation piles, but they build in opposite directions: four foundations start with Aces and build upward (A→2→3→…→K) in their respective suits, while the other four start with Kings and build downward (K→Q→J→…→A).

Setup: eight tableau columns are each dealt four cards face-up. The remaining seventy-two cards form the stock.

Play: click a card to select it (highlighted in blue), then click a foundation or tableau column to move it. Only the top card of each tableau column is available. Tableau building is strict — same suit, adjacent rank (either higher or lower). You may move a card to any empty tableau column.

Draw from the stock one card at a time; the top waste card is always playable to foundations or tableau. When the stock is exhausted, you may recycle the waste twice.

The challenge lies in managing both building directions simultaneously: a 7 of hearts might need to go on an 8 of hearts (building down toward an Ace) or a 6 of hearts (building up toward a King) depending on which foundation row is further along.

Score: 5 points per card moved to a foundation. A complete game scores 520 points.`,
  settings: algerianPatienceSettings,
  initialState: (seed: number) => initialState(seed, {} as AlgerianPatienceSettings),
  reducer,
  isTerminal,
  component: AlgerianPatience,
};
