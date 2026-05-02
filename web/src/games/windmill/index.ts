import type { GamePlugin } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { WindmillState, WindmillAction } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { Windmill } from "./Windmill.js";

export const windmillSettings = {} as const;

type WindmillSettings = SettingsOf<typeof windmillSettings>;

export const windmillPlugin: GamePlugin<WindmillState, WindmillAction, typeof windmillSettings> = {
  id: "windmill",
  title: "Windmill",
  category: "solitaire",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Build four foundations from the windmill sails using stock and a reserve slot.",
  howToPlay: `Windmill is a patience game built around a cross-shaped layout of sail columns and corner foundations.

Setup: One Ace is placed face-up in the center as the seed foundation. Four sail columns of 2 face-up cards each radiate from the center. Four corner foundation piles start empty. A stock and waste pile sit to the left, plus one reserve slot.

Goal: Fill all five foundations — the center and all four corners — from Ace up to King following suit (standard Ace-to-King same-suit build). When all 52 cards are on foundations you win.

Sail columns: Build down by any suit (rank only matters). Only single-card moves. Sails are a temporary holding area — use them to uncover cards you need.

Reserve: Holds exactly one card from the waste or a sail top. Play it to a foundation or sail when the time is right.

Stock & Waste: Click the stock to flip one card to the waste. When the stock empties it automatically recycles from the waste.

Tips: Prioritize getting Aces onto the corner foundations as early as possible. The reserve is a precious single buffer — plan its use carefully. Keep at least one sail column from growing too long so you don't bury useful cards.`,
  settings: windmillSettings,
  initialState: (seed: number, _settings: WindmillSettings) => initialState(seed),
  reducer,
  isTerminal,
  hint: (state) => isTerminal(state) ? null : { selector: '[data-testid="play-restart-btn"]', pulses: 3 },
  component: Windmill,
};
