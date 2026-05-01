import type { GamePlugin } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { SomersetState, SomersetAction, SomersetSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { SomersetGame } from "./Game.js";

const settings = { _dummy: { kind: "boolean" as const, label: "_", default: false } } as const;
type S = SettingsOf<typeof settings>;
export const somersetPlugin: GamePlugin<SomersetState, SomersetAction, typeof settings> = {
  id: "somerset",
  title: "Somerset",
  category: "solitaire",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Somerset — descending fan deal, no stock.",
  howToPlay: "Somerset — descending fan deal, no stock. Use drag-and-drop or click a card to auto-move it to the best legal destination. The Auto-move button finishes the foundations once the board is solved.",
  settings,
  initialState: (seed: number, s: S) => initialState(seed, s as SomersetSettings),
  reducer,
  isTerminal,
  component: SomersetGame,
};
