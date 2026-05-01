import type { GamePlugin } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { CarltonSoliState, CarltonSoliAction, CarltonSoliSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { CarltonSoliGame } from "./Game.js";

const settings = { _dummy: { kind: "boolean" as const, label: "_", default: false } } as const;
type S = SettingsOf<typeof settings>;
export const carltonSoliPlugin: GamePlugin<CarltonSoliState, CarltonSoliAction, typeof settings> = {
  id: "carlton-soli",
  title: "Carlton Solitaire",
  category: "solitaire",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Carlton — two-deck twelve-column patience.",
  howToPlay: "Carlton — two-deck twelve-column patience. Use drag-and-drop or click a card to auto-move it to the best legal destination. The Auto-move button finishes the foundations once the board is solved.",
  settings,
  initialState: (seed: number, s: S) => initialState(seed, s as CarltonSoliSettings),
  reducer,
  isTerminal,
  component: CarltonSoliGame,
};
