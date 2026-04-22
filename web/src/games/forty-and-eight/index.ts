import type { GamePlugin } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { FortyAndEightState, FortyAndEightAction } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { FortyAndEight } from "./FortyAndEight.js";

export const fortyAndEightSettings = {} as const;

type FortyAndEightSettings = SettingsOf<typeof fortyAndEightSettings>;

export const fortyAndEightPlugin: GamePlugin<FortyAndEightState, FortyAndEightAction, typeof fortyAndEightSettings> = {
  id: "forty-and-eight",
  title: "Forty and Eight",
  category: "solitaire",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Two-deck variant of Forty Thieves with 8 columns of 5 cards and one redeal.",
  howToPlay: `Move all 104 cards (two decks) to the eight foundations to win.

Deal: Eight tableau columns of five face-up cards each (40 cards total). Eight foundations sit at top-right. The remaining 64 cards form the stock at top-left with one redeal allowed.

Tableau: Build down in the same suit only — a 6♥ may only land on a 7♥. Only one card may be moved at a time. Empty columns accept any single card.

Stock and Waste: Click the stock to flip one card at a time to the waste. The top of the waste is always playable. When the stock is exhausted, click it once more to redeal the waste (one redeal allowed total).

Foundations: Build each foundation up in suit from Ace (A) to King (K). Two foundation piles per suit because two decks are in play.

Scoring: +10 per card moved to a foundation.

Strategy: This game is very challenging. Prioritize clearing waste cards early so the redeal is not wasted. Protect empty columns — they are precious parking spots. Try to form same-suit runs on the tableau to unlock deeper cards and keep foundations advancing in sync.`,
  settings: fortyAndEightSettings,
  initialState: (seed: number, settings: FortyAndEightSettings) => initialState(seed, settings),
  reducer,
  isTerminal,
  component: FortyAndEight,
};
