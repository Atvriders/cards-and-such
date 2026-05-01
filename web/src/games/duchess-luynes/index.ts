import type { GamePlugin } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { DuchessLuynesState, DuchessLuynesAction, DuchessLuynesSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { DuchessLuynesGame } from "./Game.js";

const settings = { _dummy: { kind: "boolean" as const, label: "_", default: false } } as const;
type S = SettingsOf<typeof settings>;
export const duchessLuynesPlugin: GamePlugin<DuchessLuynesState, DuchessLuynesAction, typeof settings> = {
  id: "duchess-luynes",
  title: "Duchess de Luynes",
  category: "solitaire",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Duchess de Luynes — two-deck four-fan layout with reserve.",
  howToPlay: "Duchess de Luynes — two-deck four-fan layout with reserve. Use drag-and-drop or click a card to auto-move it to the best legal destination. The Auto-move button finishes the foundations once the board is solved.",
  settings,
  initialState: (seed: number, s: S) => initialState(seed, s as DuchessLuynesSettings),
  reducer,
  isTerminal,
  component: DuchessLuynesGame,
};
