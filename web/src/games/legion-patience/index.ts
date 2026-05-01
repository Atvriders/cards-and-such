import type { GamePlugin } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { LegionPatienceState, LegionPatienceAction, LegionPatienceSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { LegionPatienceGame } from "./Game.js";

const settings = { _dummy: { kind: "boolean" as const, label: "_", default: false } } as const;
type S = SettingsOf<typeof settings>;
export const legionPatiencePlugin: GamePlugin<LegionPatienceState, LegionPatienceAction, typeof settings> = {
  id: "legion-patience",
  title: "Legion Patience",
  category: "solitaire",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Two-deck Legion: eight columns, no redeals.",
  howToPlay: "Two-deck Legion: eight columns, no redeals. Use drag-and-drop or click a card to auto-move it to the best legal destination. The Auto-move button finishes the foundations once the board is solved.",
  settings,
  initialState: (seed: number, s: S) => initialState(seed, s as LegionPatienceSettings),
  reducer,
  isTerminal,
  component: LegionPatienceGame,
};
