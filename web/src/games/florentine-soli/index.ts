import type { GamePlugin } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { FlorentineSoliState, FlorentineSoliAction, FlorentineSoliSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { FlorentineSoliGame } from "./Game.js";

const settings = { _dummy: { kind: "boolean" as const, label: "_", default: false } } as const;
type S = SettingsOf<typeof settings>;
export const florentineSoliPlugin: GamePlugin<FlorentineSoliState, FlorentineSoliAction, typeof settings> = {
  id: "florentine-soli",
  title: "Florentine Solitaire",
  category: "solitaire",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Compact Florentine — four reserves and a single-card draw.",
  howToPlay: "Compact Florentine — four reserves and a single-card draw. Use drag-and-drop or click a card to auto-move it to the best legal destination. The Auto-move button finishes the foundations once the board is solved.",
  settings,
  initialState: (seed: number, s: S) => initialState(seed, s as FlorentineSoliSettings),
  reducer,
  isTerminal,
  component: FlorentineSoliGame,
};
