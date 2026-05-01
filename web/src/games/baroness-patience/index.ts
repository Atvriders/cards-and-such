import type { GamePlugin } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { BaronessPatienceState, BaronessPatienceAction, BaronessPatienceSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { BaronessPatienceGame } from "./Game.js";

const settings = { _dummy: { kind: "boolean" as const, label: "_", default: false } } as const;
type S = SettingsOf<typeof settings>;
export const baronessPatiencePlugin: GamePlugin<BaronessPatienceState, BaronessPatienceAction, typeof settings> = {
  id: "baroness-patience",
  title: "Baroness Patience",
  category: "solitaire",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Five-pile Baroness: pair-13 removal across rows; engine simplified to a Klondike-style hand-out.",
  howToPlay: "Five-pile Baroness: pair-13 removal across rows; engine simplified to a Klondike-style hand-out. Use drag-and-drop or click a card to auto-move it to the best legal destination. The Auto-move button finishes the foundations once the board is solved.",
  settings,
  initialState: (seed: number, s: S) => initialState(seed, s as BaronessPatienceSettings),
  reducer,
  isTerminal,
  component: BaronessPatienceGame,
};
