import type { GamePlugin, SettingsOf } from "../../platform/game-plugin/types.js";
import type { PyramidState, PyramidAction } from "./state.js";
import { initialState, reducer, isTerminal, pyramidSettings } from "./state.js";
import { Pyramid } from "./Pyramid.js";

type PyramidSettings = SettingsOf<typeof pyramidSettings>;

export const pyramidPlugin: GamePlugin<PyramidState, PyramidAction, typeof pyramidSettings> = {
  id: "pyramid",
  title: "Pyramid Solitaire",
  category: "solitaire",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Pair cards that add to 13. Clear the pyramid.",
  howToPlay: `Remove all 28 pyramid cards by pairing any two uncovered cards whose ranks sum to 13. Kings (value 13) are removed alone — just click them.

Card values: Ace = 1, numbered cards at face value, Jack = 11, Queen = 12, King = 13. Pairs that work: A+Q, 2+J, 3+10, 4+9, 5+8, 6+7.

Layout: A 7-row pyramid with the apex at the top. A card is uncovered only when both cards that rest on it are removed. The stock and waste pile sit below. Click a card from the pyramid to select it (it highlights), then click a matching card to pair and remove both. You may also pair a pyramid card with the top card of the waste pile.

Draw: Click the stock to flip one card at a time onto the waste. Redeals allow you to recycle the waste back through the stock — set how many redeals you want before starting (0, 1, or 3).

Scoring: +5 per card removed. Clearing the entire pyramid adds a completion bonus. Fewer draws and redeals = higher score.

Tips: Work from the base of the pyramid upward to expose the apex. Keep an eye on which cards you still need — if both 6s are buried, your 7s become less useful.`,
  settings: pyramidSettings,
  initialState: (seed: number, settings: PyramidSettings) => initialState(seed, settings),
  reducer,
  isTerminal,
  component: Pyramid,
};
