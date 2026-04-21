import type { GamePlugin } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { FortyThievesState, FortyThievesAction } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { FortyThieves } from "./FortyThieves.js";

export const fortyThievesSettings = {} as const;

type FortyThievesSettings = SettingsOf<typeof fortyThievesSettings>;

export const fortyThievesPlugin: GamePlugin<FortyThievesState, FortyThievesAction, typeof fortyThievesSettings> = {
  id: "forty-thieves",
  title: "Forty Thieves",
  category: "solitaire",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Two-deck solitaire. Build tableau down same-suit, one card at a time.",
  howToPlay: `Move all 104 cards (two full decks) to the eight foundations to win.

Deal: Ten tableau columns of four face-up cards each (40 total). Eight foundations sit at top-right — two per suit. The remaining 64 cards form the stock.

Moves: Only one card may be moved at a time. On the tableau, build down in the same suit — a 6♠ lands only on a 7♠. Empty columns accept any single card. Drag a card or click it to auto-move to a valid destination. Click the stock to flip one card at a time to the waste; the waste top is always playable. There is no redeal.

Foundations start with Aces and build up by suit to King. Because two decks are in play, each suit has two foundation piles.

Scoring: +10 for each card moved to a foundation.

Tips: This game is very difficult — fewer than 1 in 6 deals win with optimal play. Keep the waste accessible by moving waste cards to foundations or tableau quickly. Empty columns are extremely valuable; use them as temporary parking spots to sequence same-suit cards. Try to build long same-suit runs on the tableau rather than scattering cards.`,
  settings: fortyThievesSettings,
  initialState: (seed: number, settings: FortyThievesSettings) => initialState(seed, settings),
  reducer,
  isTerminal,
  component: FortyThieves,
};
