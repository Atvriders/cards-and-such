import type { GamePlugin } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { MonteCarloState, MonteCarloAction } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { MonteCarlo } from "./MonteCarlo.js";

export const monteCarloSettings = {} as const;

type MonteCarloSettings = SettingsOf<typeof monteCarloSettings>;

export const monteCarloPlugin: GamePlugin<MonteCarloState, MonteCarloAction, typeof monteCarloSettings> = {
  id: "monte-carlo",
  title: "Monte Carlo",
  category: "solitaire",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Remove pairs of adjacent same-rank cards. Deal new cards after each clear.",
  howToPlay: `Remove all 52 cards from the grid to win.

Deal: Twenty-five cards are laid out face-up in a 5×5 grid. The remaining 27 cards form the stock off to the side.

Moves: Click a card to select it (it highlights in gold). Then click any adjacent card of the same rank — adjacent means horizontally, vertically, or diagonally touching. A matched pair is removed from the grid. After each removal, all remaining cards slide left-to-right and top-to-bottom to fill the gaps (the grid compacts), and new cards from the stock are dealt into the vacated positions at the end.

Win: Remove every pair until the grid and stock are both empty.

Lose: You are stuck if no adjacent same-rank pairs remain and the stock is exhausted.

Scoring: +2 points per pair removed (one per card).

Tips: Look for multiple pairs that share a neighbor — removing one can slide cards together and create new pairs. Cards near the right and bottom of the grid are "buried" deeper in the stock, so plan ahead. Pairs of high-count ranks (like 4s or 5s) are statistically easier to find adjacent.`,
  settings: monteCarloSettings,
  initialState: (seed: number, settings: MonteCarloSettings) => initialState(seed, settings),
  reducer,
  isTerminal,
  component: MonteCarlo,
};
