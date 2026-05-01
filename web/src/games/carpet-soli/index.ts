import type { GamePlugin } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { CarpetSoliState, CarpetSoliAction, CarpetSoliSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { CarpetSoliGame } from "./Game.js";

const settings = { _dummy: { kind: "boolean" as const, label: "_", default: false } } as const;
type S = SettingsOf<typeof settings>;
export const carpetSoliPlugin: GamePlugin<CarpetSoliState, CarpetSoliAction, typeof settings> = {
  id: "carpet-soli",
  title: "Carpet Solitaire",
  category: "solitaire",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Carpet — 20 reserve cells, two-deck.",
  howToPlay: "Carpet — 20 reserve cells, two-deck. Use drag-and-drop or click a card to auto-move it to the best legal destination. The Auto-move button finishes the foundations once the board is solved.",
  settings,
  initialState: (seed: number, s: S) => initialState(seed, s as CarpetSoliSettings),
  reducer,
  isTerminal,
  component: CarpetSoliGame,
};
