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
  settings: pyramidSettings,
  initialState: (seed: number, settings: PyramidSettings) => initialState(seed, settings),
  reducer,
  isTerminal,
  component: Pyramid,
};
