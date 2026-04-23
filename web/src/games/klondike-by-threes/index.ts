import type { GamePlugin } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { KlondikeByThreesState, KlondikeByThreesAction } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { KlondikeByThrees } from "./KlondikeByThrees.js";

export const kbt3Settings = {
  redeals: {
    kind: "enum" as const,
    label: "Redeals",
    options: ["unlimited", "3"] as const,
    default: "unlimited" as const,
  },
} as const;

type KBT3Settings = SettingsOf<typeof kbt3Settings>;

export const klondikeByThreesPlugin: GamePlugin<KlondikeByThreesState, KlondikeByThreesAction, typeof kbt3Settings> = {
  id: "klondike-by-threes",
  title: "Klondike by Threes",
  category: "solitaire",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Classic Klondike with draw-3 stock — only the top of the three is playable.",
  howToPlay: `Klondike by Threes is the draw-three variant of Klondike — widely considered the "standard" casino version and significantly harder than draw-one.

Setup: Identical to Klondike — seven tableau columns with 1–7 cards each (only the top card face-up), a stock, waste, and four foundations.

Goal: Move all 52 cards to the four foundations, building each from Ace up to King in the same suit.

Draw rule: Click the stock to flip three cards to the waste at once. Only the topmost of the three is playable. To reach buried cards, you must play or move the cards above them first by cycling through the waste.

Tableau rules: Build columns down in alternating colors (red on black). Move single cards or valid alternating-color sequences. Empty columns accept only Kings.

Redeals: You may choose unlimited redeals (cycle through the waste as many times as needed) or limit yourself to exactly 3 redeals for a tougher challenge.

Tips: Draw-three dramatically limits card access compared to draw-one. Think ahead about the order cards will appear in the waste. Plan to clear columns to empty so Kings can anchor new sequences. The limited redeal option adds significant extra pressure — count your remaining redeals carefully.`,
  settings: kbt3Settings,
  initialState: (seed: number, settings: KBT3Settings) => initialState(seed, settings),
  reducer,
  isTerminal,
  component: KlondikeByThrees,
};
