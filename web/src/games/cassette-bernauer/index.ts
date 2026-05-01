import type { GamePlugin } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { CassetteBernauerState, CassetteBernauerAction, CassetteBernauerSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { CassetteBernauerGame } from "./Game.js";

const settings = { _dummy: { kind: "boolean" as const, label: "_", default: false } } as const;
type S = SettingsOf<typeof settings>;
export const cassetteBernauerPlugin: GamePlugin<CassetteBernauerState, CassetteBernauerAction, typeof settings> = {
  id: "cassette-bernauer",
  title: "Cassette Bernauer",
  category: "solitaire",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Compact Bernauer cassette: 8 columns, same-colour tableau.",
  howToPlay: "Compact Bernauer cassette: 8 columns, same-colour tableau. Use drag-and-drop or click a card to auto-move it to the best legal destination. The Auto-move button finishes the foundations once the board is solved.",
  settings,
  initialState: (seed: number, s: S) => initialState(seed, s as CassetteBernauerSettings),
  reducer,
  isTerminal,
  component: CassetteBernauerGame,
};
