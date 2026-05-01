import type { GamePlugin } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { QuiltPatState, QuiltPatAction, QuiltPatSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { QuiltPatGame } from "./Game.js";

const settings = { _dummy: { kind: "boolean" as const, label: "_", default: false } } as const;
type S = SettingsOf<typeof settings>;
export const quiltPatPlugin: GamePlugin<QuiltPatState, QuiltPatAction, typeof settings> = {
  id: "quilt-pat",
  title: "Quilt Patience",
  category: "solitaire",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Two-deck Quilt — eight 4-card columns.",
  howToPlay: "Two-deck Quilt — eight 4-card columns. Use drag-and-drop or click a card to auto-move it to the best legal destination. The Auto-move button finishes the foundations once the board is solved.",
  settings,
  initialState: (seed: number, s: S) => initialState(seed, s as QuiltPatSettings),
  reducer,
  isTerminal,
  component: QuiltPatGame,
};
