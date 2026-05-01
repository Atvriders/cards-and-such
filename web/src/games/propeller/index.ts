import type { GamePlugin } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { PropellerState, PropellerAction, PropellerSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { PropellerGame } from "./Game.js";

const settings = { _dummy: { kind: "boolean" as const, label: "_", default: false } } as const;
type S = SettingsOf<typeof settings>;
export const propellerPlugin: GamePlugin<PropellerState, PropellerAction, typeof settings> = {
  id: "propeller",
  title: "Propeller",
  category: "solitaire",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Compact propeller layout, alternating-colour tableau.",
  howToPlay: "Compact propeller layout, alternating-colour tableau. Use drag-and-drop or click a card to auto-move it to the best legal destination. The Auto-move button finishes the foundations once the board is solved.",
  settings,
  initialState: (seed: number, s: S) => initialState(seed, s as PropellerSettings),
  reducer,
  isTerminal,
  component: PropellerGame,
};
