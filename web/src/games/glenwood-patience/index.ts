import type { GamePlugin } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { GlenwoodPatienceState, GlenwoodPatienceAction, GlenwoodPatienceSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { GlenwoodPatienceGame } from "./Game.js";

const settings = { _dummy: { kind: "boolean" as const, label: "_", default: false } } as const;
type S = SettingsOf<typeof settings>;
export const glenwoodPatiencePlugin: GamePlugin<GlenwoodPatienceState, GlenwoodPatienceAction, typeof settings> = {
  id: "glenwood-patience",
  title: "Glenwood Patience",
  category: "solitaire",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Glenwood: Canfield-style with a single-card draw and one redeal.",
  howToPlay: "Glenwood: Canfield-style with a single-card draw and one redeal. Use drag-and-drop or click a card to auto-move it to the best legal destination. The Auto-move button finishes the foundations once the board is solved.",
  settings,
  initialState: (seed: number, s: S) => initialState(seed, s as GlenwoodPatienceSettings),
  reducer,
  isTerminal,
  component: GlenwoodPatienceGame,
};
