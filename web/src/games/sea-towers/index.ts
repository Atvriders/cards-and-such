import type { GamePlugin } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { SeaTowersState, SeaTowersAction } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { SeaTowers } from "./SeaTowers.js";

export const seaTowersSettings = {} as const;

type SeaTowersSettings = SettingsOf<typeof seaTowersSettings>;

export const seaTowersPlugin: GamePlugin<SeaTowersState, SeaTowersAction, typeof seaTowersSettings> = {
  id: "sea-towers",
  title: "Sea Towers",
  category: "solitaire",
  players: { min: 1, max: 1, multiplayer: false },
  description: "A FreeCell variant where tableau builds down in the same suit and only Kings fill empty columns.",
  howToPlay: `Sea Towers (also called Seahaven Towers) is a challenging FreeCell-style game with a key twist: tableau columns build down by the same suit instead of alternating colors.

Setup: All 52 cards are dealt face-up across 10 cascades of 5 cards each. Two of the four free cells start pre-filled with the two leftover cards, leaving only two free cells available at the start.

Goal: Move all 52 cards to the four foundation piles, building each foundation up from Ace to King in the same suit.

Tableau rules: Place a card on another only if it is the same suit and exactly one rank lower. For example, 7♠ may go onto 8♠. Only a King may be placed into an empty cascade — no other card may start a new column.

Free cells: Each of the four cells holds exactly one card. Use them as temporary buffers when rearranging the tableau.

Strategy: Because same-suit building is stricter than alternating-color building, fewer moves are available at any moment. Plan carefully before committing cards to free cells. Freeing buried Aces early is essential, and keeping at least one free cell open provides crucial flexibility.`,
  settings: seaTowersSettings,
  initialState: (seed: number, _settings: SeaTowersSettings) => initialState(seed),
  reducer,
  isTerminal,
  component: SeaTowers,
};
