import type { GamePlugin } from "../../platform/game-plugin/types.js";
import type { GizaState, GizaAction } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { Game } from "./Game.js";

export const gizaSettings = {} as const;

export const gizaPlugin: GamePlugin<GizaState, GizaAction, typeof gizaSettings> = {
  id: "giza",
  title: "Giza",
  category: "solitaire",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Three mini-pyramids — pair up cards that sum to 13 to clear them.",
  howToPlay: `Giza is a Pyramid-style solitaire featuring three stacked mini-pyramids, played with one standard deck of 52 cards.

Setup: 27 cards are laid out in three separate pyramid sections, each shaped like a 3-row triangle (1 card on top, 2 in the middle, 3 on the base). The remaining 25 cards form the stock.

Accessibility: A card is accessible only if neither of the two cards directly below it in the same pyramid remains. The base row is always accessible. Cards covered by any existing card below are blocked.

Removing pairs: Select any two accessible cards whose ranks sum to exactly 13 (Ace+Queen, 2+Jack, 3+10, 4+9, 5+8, 6+7). Click one card to select it (highlighted in gold), then click a second to attempt the pair. Matched pairs are removed from the pyramid.

Foundation: Four foundation piles build up from Ace to King in the same suit. Aces go to foundations automatically when drawn from stock. Use the stock to draw additional cards that can be paired or played to foundations.

Goal: Clear all three pyramids and exhaust the stock.

Scoring: +10 for each pair removed; +15 for each card sent to a foundation.`,
  settings: gizaSettings,
  initialState: (seed: number) => initialState(seed, {}),
  reducer,
  isTerminal,
  component: Game,
};
