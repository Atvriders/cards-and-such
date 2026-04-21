import type { GamePlugin, SettingsOf } from "../../platform/game-plugin/types.js";
import type { TriPeaksState, TriPeaksAction } from "./state.js";
import { initialState, reducer, isTerminal, triPeaksSettings } from "./state.js";
import { TriPeaks } from "./TriPeaks.js";

type TriPeaksSettings = SettingsOf<typeof triPeaksSettings>;

export const triPeaksPlugin: GamePlugin<TriPeaksState, TriPeaksAction, typeof triPeaksSettings> = {
  id: "tri-peaks",
  title: "TriPeaks",
  category: "solitaire",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Three peaks to clear. Remove cards one rank up or down from the current.",
  settings: triPeaksSettings,
  initialState: (seed: number, settings: TriPeaksSettings) => initialState(seed, settings),
  reducer,
  isTerminal,
  component: TriPeaks,
};
