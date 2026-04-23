import type { GamePlugin } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { EasthavenState, EasthavenAction } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { Easthaven } from "./Easthaven.js";

export const easthavenSettings = {} as const;

type EasthavenSettings = SettingsOf<typeof easthavenSettings>;

export const easthavenPlugin: GamePlugin<EasthavenState, EasthavenAction, typeof easthavenSettings> = {
  id: "easthaven",
  title: "Easthaven",
  category: "solitaire",
  players: { min: 1, max: 1, multiplayer: false },
  description: "A compact Spider-like game — 7 columns, alternating-color tableau, deal 7 at a time from stock.",
  howToPlay: `Easthaven is a compact solitaire that sits between Klondike and Spider in style and difficulty.

Setup: Seven tableau columns each start with 3 cards. Only the top card of each column is face-up; the other two are face-down. The remaining 31 cards form the stock. Four foundations start empty.

Goal: Build all four foundations from Ace up to King in the same suit.

Tableau rules: Build columns down in alternating colors (red on black, black on red), just like Klondike. You may move single cards or valid alternating-color sequences. Empty columns accept any card.

Stock: Click the stock to deal one card face-up to each of the seven columns simultaneously. Each dealt card reveals itself and extends the column. You cannot deal if the stock is empty.

Foundation rules: Move Aces to foundations as soon as they appear, then build up in the same suit: A, 2, 3, … K.

Tips: Unlike Klondike there is no waste pile — cards come out in rows of seven, so you cannot selectively draw. Plan tableau moves before each deal to ensure as many columns as possible can accept their new card. Clearing columns to empty is valuable but harder than in Klondike since columns start with 3 hidden cards.`,
  settings: easthavenSettings,
  initialState: (seed: number, _settings: EasthavenSettings) => initialState(seed),
  reducer,
  isTerminal,
  component: Easthaven,
};
