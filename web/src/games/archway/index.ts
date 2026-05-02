import type { GamePlugin } from "../../platform/game-plugin/types.js";
import type { ArchwayState, ArchwayAction } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { Archway } from "./Archway.js";

export const archwayPlugin: GamePlugin<ArchwayState, ArchwayAction, Record<string, never>> = {
  id: "archway",
  title: "Archway",
  category: "solitaire",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Two-deck patience: fill 8 foundations both upward (A→K) and downward (K→A) by suit.",
  howToPlay: `Archway is a two-deck patience game with a dual foundation challenge. Your goal is to fill all 8 foundation piles — 4 build from Ace to King (ascending) and 4 build from King to Ace (descending), one pile per suit in each direction.

Deal: 104 cards (two standard decks shuffled together) are dealt into 12 fans of 4 cards each. The remaining cards form the stock.

Layout: The 12 fans are displayed in the center. The 8 foundations sit at the top — left group starts with Aces, right group starts with Kings. Each suit needs exactly one ascending and one descending foundation.

Moves: Click the top (exposed) card of any fan to automatically send it to a matching foundation. Aces go to ascending foundations, Kings go to descending ones, and intermediate cards follow their respective sequences. Click Draw to flip the next stock card; it auto-places on a foundation if possible, otherwise it extends the fan layout.

Scoring: +1 point for each card placed on a foundation. Maximum possible score is 104.

Tips: Clear fans early to free up maneuvering room. Pay attention to both ascending and descending options for the same suit — a card may be playable in one direction even when the other is blocked.`,
  settings: {} as const,
  initialState: (seed: number) => initialState(seed),
  reducer,
  isTerminal,
  hint: (state) => isTerminal(state) ? null : { selector: '[data-testid="play-restart-btn"]', pulses: 3 },
  component: Archway,
};
