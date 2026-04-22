import type { GamePlugin } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { EmperorState, EmperorAction } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { Emperor } from "./Emperor.js";

export const emperorSettings = {} as const;

type EmperorSettings = SettingsOf<typeof emperorSettings>;

export const emperorPlugin: GamePlugin<EmperorState, EmperorAction, typeof emperorSettings> = {
  id: "emperor",
  title: "Emperor",
  category: "solitaire",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Two-deck Klondike variant. 10 columns with face-down cards, alternate-color tableau.",
  howToPlay: `Move all 104 cards (two decks) to the eight foundations to win.

Deal: Ten tableau columns of four cards each — the bottom three are face-down and only the top card is face-up (40 cards total). Eight foundations sit at top-right. The remaining 64 cards form the stock. No redeals.

Tableau: Build down in alternating colors — red on black, black on red — just like Klondike. Valid alternating-color descending sequences may be moved as groups. When a face-down card is uncovered, it flips face-up automatically. Empty columns accept any card or sequence.

Stock: Click to flip one card at a time to the waste. The waste top is always playable. There is no redeal, so each stock card is precious.

Foundations: Build up in suit from Ace to King. Two foundations per suit because two decks are used.

Scoring: +10 per card placed on a foundation.

Strategy: Uncover face-down cards as quickly as possible — they contain hidden opportunities. Manage empty columns carefully. Unlike Klondike the stock has no redeal, so avoid drawing unless you have a plan for the new card.`,
  settings: emperorSettings,
  initialState: (seed: number, settings: EmperorSettings) => initialState(seed, settings),
  reducer,
  isTerminal,
  component: Emperor,
};
