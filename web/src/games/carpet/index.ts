import type { GamePlugin } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { CarpetState, CarpetAction } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { Carpet } from "./Carpet.js";

export const carpetSettings = {} as const;

type CarpetSettings = SettingsOf<typeof carpetSettings>;

export const carpetPlugin: GamePlugin<CarpetState, CarpetAction, typeof carpetSettings> = {
  id: "carpet",
  title: "Carpet",
  category: "solitaire",
  players: { min: 1, max: 1, multiplayer: false },
  description: "A 5×4 grid of face-up cards surrounded by foundations and free cells. Draw from stock and play cards to foundations; empty grid spots refill automatically.",
  howToPlay: `Carpet presents twenty face-up cards in a 5×4 grid (the "carpet"), four foundation piles, and four free cells. A stock of thirty-two cards sits face-down to be flipped one at a time.

Objective: Move all 52 cards to the four foundations, building each one from Ace up to King in the same suit.

Grid: The 20 carpet positions each hold one card and are all visible from the start. Clicking a grid card sends it to a matching foundation if legal, or parks it in an empty free cell. Whenever a grid position becomes empty, it is automatically refilled with the next card from the stock.

Free cells: Each cell holds exactly one card. Cells serve as temporary parking spots — click a cell card to send it to a foundation when it becomes playable.

Stock and Waste: Click the stock to flip one card to the waste. Click the waste card to play it to a foundation or to an empty free cell. When the stock is exhausted, the waste is automatically turned over for a second pass.

Scoring: +10 for each card moved to a foundation.

Tips: Prioritize Aces and low cards — they unblock foundations. Use free cells sparingly since all four may fill quickly. Try to expose Aces buried in the grid by cycling the stock strategically.`,
  settings: carpetSettings,
  initialState: (seed: number, settings: CarpetSettings) => initialState(seed, settings),
  reducer,
  isTerminal,
  component: Carpet,
};
