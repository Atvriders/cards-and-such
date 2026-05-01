import type { GamePlugin } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { KingsQueensState, KingsQueensAction, KingsQueensSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { KingsQueensGame } from "./Game.js";

const settings = { _dummy: { kind: "boolean" as const, label: "_", default: false } } as const;
type S = SettingsOf<typeof settings>;
export const kingsQueensPlugin: GamePlugin<KingsQueensState, KingsQueensAction, typeof settings> = {
  id: "kings-queens",
  title: "Kings & Queens",
  category: "solitaire",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Two-deck: build foundations from Aces and Kings on opposite sides.",
  howToPlay: "Two-deck: build foundations from Aces and Kings on opposite sides. Use drag-and-drop or click a card to auto-move it to the best legal destination. The Auto-move button finishes the foundations once the board is solved.",
  settings,
  initialState: (seed: number, s: S) => initialState(seed, s as KingsQueensSettings),
  reducer,
  isTerminal,
  component: KingsQueensGame,
};
