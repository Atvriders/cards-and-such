import type { GamePlugin } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { GargantuaState, GargantuaAction, GargantuaSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { GargantuaGame } from "./Game.js";

const settings = { _dummy: { kind: "boolean" as const, label: "_", default: false } } as const;
type S = SettingsOf<typeof settings>;
export const gargantuaPlugin: GamePlugin<GargantuaState, GargantuaAction, typeof settings> = {
  id: "gargantua",
  title: "Gargantua",
  category: "solitaire",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Two-deck Klondike — large, sprawling layout.",
  howToPlay: "Two-deck Klondike — large, sprawling layout. Use drag-and-drop or click a card to auto-move it to the best legal destination. The Auto-move button finishes the foundations once the board is solved.",
  settings,
  initialState: (seed: number, s: S) => initialState(seed, s as GargantuaSettings),
  reducer,
  isTerminal,
  component: GargantuaGame,
};
