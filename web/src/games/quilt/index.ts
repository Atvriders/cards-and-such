import type { GamePlugin } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { QuiltState, QuiltAction, QuiltSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { QuiltGame } from "./Game.js";

const settings = { _dummy: { kind: "boolean" as const, label: "_", default: false } } as const;
type S = SettingsOf<typeof settings>;
export const quiltPlugin: GamePlugin<QuiltState, QuiltAction, typeof settings> = {
  id: "quilt",
  title: "Quilt",
  category: "solitaire",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Quilt — patchwork two-deck variant.",
  howToPlay: "Quilt — patchwork two-deck variant. Use drag-and-drop or click a card to auto-move it to the best legal destination. The Auto-move button finishes the foundations once the board is solved.",
  settings,
  initialState: (seed: number, s: S) => initialState(seed, s as QuiltSettings),
  reducer,
  isTerminal,
  component: QuiltGame,
};
