import type { GamePlugin } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { CongressState, CongressAction } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { Congress } from "./Congress.js";

export const congressSettings = {} as const;

type CongressSettings = SettingsOf<typeof congressSettings>;

export const congressPlugin: GamePlugin<CongressState, CongressAction, typeof congressSettings> = {
  id: "congress",
  title: "Congress",
  category: "solitaire",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Two-deck solitaire with 8 reserve cells, 4 tableau columns, and a stock.",
  howToPlay: `Move all 104 cards (two decks) to the eight foundations to win.

Deal: Eight reserve cells along the top are each pre-filled with one card (8 total). Four tableau columns each receive eight face-up cards (32 total). The remaining 64 cards form the stock. Eight foundations at top-right must each be built up in suit from Ace to King.

Reserve: Each of the eight reserve slots holds one card. You may move a reserve card to a foundation or onto a tableau column, or park a single card from the tableau into an empty reserve slot.

Tableau: Build down by rank, any suit — a 7 of any suit may land on any 8. Sequences may be moved together. Empty tableau columns accept any card or sequence.

Stock: Click to flip one card at a time to the waste. No redeal.

Scoring: +10 per card moved to a foundation.

Strategy: The reserves give you crucial extra flexibility. Prioritize moving reserve Aces and 2s to the foundations immediately. Use empty reserve slots sparingly — they fill up fast. Plan sequence moves carefully; tableau columns can grow long and become hard to rearrange.`,
  settings: congressSettings,
  initialState: (seed: number, settings: CongressSettings) => initialState(seed, settings),
  reducer,
  isTerminal,
  component: Congress,
};
