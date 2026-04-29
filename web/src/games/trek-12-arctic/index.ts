import type { GamePlugin, SettingsOf } from "../../platform/game-plugin/types.js";
import type { Trek12ArcticState, Trek12ArcticAction, Trek12ArcticSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { Trek12ArcticGame } from "./Game.js";
const settings = { dummy: { kind: "boolean" as const, label: "dummy", default: false } } as const;
type S = SettingsOf<typeof settings>;
export const trek12ArcticPlugin: GamePlugin<Trek12ArcticState, Trek12ArcticAction, typeof settings> = {
  id: "trek-12-arctic",
  title: "Trek 12: Arctic",
  category: "board",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Arctic Trek 12 variant; ice-shelf hex map.",
  howToPlay: "Trek 12: Arctic is a polar Trek 12 variant where you cross ice shelves on a 4x4 expedition map. Each die represents a day's progress.\n\nEach round, click Roll to generate a die (1-6) representing daily distance. Click any empty cell to record that day's expedition camp. Click Skip to wait out a blizzard (lose the round).\n\nScoring:\n- Each camp cell scores its pip (1-6).\n- +5 per row (latitude crossing complete).\n- +5 per column (longitudinal sweep).\n- +10 for fully crossed Arctic (expedition success).\n\n12 rolls available. Arctic Trek penalizes hesitation — every skipped day is a lost camp. Strategy: place high pips at row/column intersections to chain bonuses. Cold rolls (1-2) still complete lines and earn bonuses, so don't disregard them. A typical expedition scores 35-55; an aggressive march reaches 65+. Trek 12: Arctic captures polar exploration in dice form. Plan your camps; the ice waits for no one.",
  settings,
  initialState: (seed: number, s: S) => initialState(seed, s as Trek12ArcticSettings),
  reducer,
  isTerminal,
  component: Trek12ArcticGame,
};
