import type { GamePlugin } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { CardPyramidGrabState, CardPyramidGrabAction, CardPyramidGrabSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { CardPyramidGrab } from "./Game.js";

const cardPyramidGrabSettings = {
  rows: { kind: "enum" as const, label: "Rows", options: ["3", "5"] as const, default: "5" as const },
} as const;

type CardPyramidGrabSettingsType = SettingsOf<typeof cardPyramidGrabSettings>;

export const cardPyramidGrabPlugin: GamePlugin<CardPyramidGrabState, CardPyramidGrabAction, typeof cardPyramidGrabSettings> = {
  id: "card-pyramid-grab",
  title: "Card Pyramid Grab",
  category: "cards",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Navigate a pyramid of face-down cards, picking one card per row. Higher ranks earn more points — choose wisely!",
  howToPlay: `Card Pyramid Grab presents a pyramid of face-down playing cards arranged in rows. Each row has one more card than the last. Your goal is to pick the highest-value card from each row.

Cards are ranked by their face value: 2 scores 2 points, 3 scores 3, and so on up to Ace which scores 14. The suit does not matter — only the rank.

On each row, all cards are face down. Click any card to reveal it and claim its points. Once you pick a card, the rest in that row stay hidden. Press Next Row to advance.

Since cards are hidden, you must rely on instinct and luck. There is no wrong choice — just try to grab the best cards you can across all rows!

Use Settings to choose a 3-row or 5-row pyramid. Your total score is the sum of all cards you selected. Can you score over 60 on a 5-row game?`,
  settings: cardPyramidGrabSettings,
  initialState: (seed: number, settings: CardPyramidGrabSettingsType) => initialState(seed, settings as CardPyramidGrabSettings),
  reducer,
  isTerminal,
  component: CardPyramidGrab,
};
