import type { GamePlugin } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { UskPatienceState, UskPatienceAction, UskPatienceSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { UskPatienceGame } from "./Game.js";

const settings = { _dummy: { kind: "boolean" as const, label: "_", default: false } } as const;
type S = SettingsOf<typeof settings>;
export const uskPatiencePlugin: GamePlugin<UskPatienceState, UskPatienceAction, typeof settings> = {
  id: "usk-patience",
  title: "Usk Patience",
  category: "solitaire",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Two-deck Usk Patience: nine columns, no redeals.",
  howToPlay: "Two-deck Usk Patience: nine columns, no redeals. Use drag-and-drop or click a card to auto-move it to the best legal destination. The Auto-move button finishes the foundations once the board is solved.",
  settings,
  initialState: (seed: number, s: S) => initialState(seed, s as UskPatienceSettings),
  reducer,
  isTerminal,
  component: UskPatienceGame,
};
