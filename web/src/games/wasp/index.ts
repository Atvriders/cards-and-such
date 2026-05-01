import type { GamePlugin } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { WaspState, WaspAction, WaspSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { WaspGame } from "./Game.js";

const settings = { _dummy: { kind: "boolean" as const, label: "_", default: false } } as const;
type S = SettingsOf<typeof settings>;
export const waspPlugin: GamePlugin<WaspState, WaspAction, typeof settings> = {
  id: "wasp",
  title: "Wasp",
  category: "solitaire",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Wasp — three reserve columns plus four fans of seven.",
  howToPlay: "Wasp — three reserve columns plus four fans of seven. Use drag-and-drop or click a card to auto-move it to the best legal destination. The Auto-move button finishes the foundations once the board is solved.",
  settings,
  initialState: (seed: number, s: S) => initialState(seed, s as WaspSettings),
  reducer,
  isTerminal,
  component: WaspGame,
};
