import type { GamePlugin } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { AgnesBernauerState, AgnesBernauerAction, AgnesBernauerSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { AgnesBernauerGame } from "./Game.js";

const settings = { _dummy: { kind: "boolean" as const, label: "_", default: false } } as const;
type S = SettingsOf<typeof settings>;
export const agnesBernauerPlugin: GamePlugin<AgnesBernauerState, AgnesBernauerAction, typeof settings> = {
  id: "agnes-bernauer",
  title: "Agnes Bernauer",
  category: "solitaire",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Two-deck Klondike-style with a 7-card reserve and same-colour tableau.",
  howToPlay: "Two-deck Klondike-style with a 7-card reserve and same-colour tableau. Use drag-and-drop or click a card to auto-move it to the best legal destination. The Auto-move button finishes the foundations once the board is solved.",
  settings,
  initialState: (seed: number, s: S) => initialState(seed, s as AgnesBernauerSettings),
  reducer,
  isTerminal,
  component: AgnesBernauerGame,
};
