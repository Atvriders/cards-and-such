import type { GamePlugin } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { StalactitesState, StalactitesAction, StalactitesSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { StalactitesGame } from "./Game.js";

const settings = { _dummy: { kind: "boolean" as const, label: "_", default: false } } as const;
type S = SettingsOf<typeof settings>;
export const stalactitesPlugin: GamePlugin<StalactitesState, StalactitesAction, typeof settings> = {
  id: "stalactites",
  title: "Stalactites",
  category: "solitaire",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Stalactites — eight 6-card columns, drip down to foundations.",
  howToPlay: "Stalactites — eight 6-card columns, drip down to foundations. Use drag-and-drop or click a card to auto-move it to the best legal destination. The Auto-move button finishes the foundations once the board is solved.",
  settings,
  initialState: (seed: number, s: S) => initialState(seed, s as StalactitesSettings),
  reducer,
  isTerminal,
  component: StalactitesGame,
};
