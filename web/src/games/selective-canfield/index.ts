import type { GamePlugin } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { SelectiveCanfieldState, SelectiveCanfieldAction, SelectiveCanfieldSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { SelectiveCanfieldGame } from "./Game.js";

const settings = { _dummy: { kind: "boolean" as const, label: "_", default: false } } as const;
type S = SettingsOf<typeof settings>;
export const selectiveCanfieldPlugin: GamePlugin<SelectiveCanfieldState, SelectiveCanfieldAction, typeof settings> = {
  id: "selective-canfield",
  title: "Selective Canfield",
  category: "solitaire",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Pick any starting foundation rank; otherwise plays as Canfield.",
  howToPlay: "Pick any starting foundation rank; otherwise plays as Canfield. Use drag-and-drop or click a card to auto-move it to the best legal destination. The Auto-move button finishes the foundations once the board is solved.",
  settings,
  initialState: (seed: number, s: S) => initialState(seed, s as SelectiveCanfieldSettings),
  reducer,
  isTerminal,
  component: SelectiveCanfieldGame,
};
