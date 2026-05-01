import type { GamePlugin } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { SomersetPatState, SomersetPatAction, SomersetPatSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { SomersetPatGame } from "./Game.js";

const settings = { _dummy: { kind: "boolean" as const, label: "_", default: false } } as const;
type S = SettingsOf<typeof settings>;
export const somersetPatPlugin: GamePlugin<SomersetPatState, SomersetPatAction, typeof settings> = {
  id: "somerset-pat",
  title: "Somerset Patience",
  category: "solitaire",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Somerset Patience variant.",
  howToPlay: "Somerset Patience variant. Use drag-and-drop or click a card to auto-move it to the best legal destination. The Auto-move button finishes the foundations once the board is solved.",
  settings,
  initialState: (seed: number, s: S) => initialState(seed, s as SomersetPatSettings),
  reducer,
  isTerminal,
  component: SomersetPatGame,
};
