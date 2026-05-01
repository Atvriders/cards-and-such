import type { GamePlugin } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { StalactitesPatState, StalactitesPatAction, StalactitesPatSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { StalactitesPatGame } from "./Game.js";

const settings = { _dummy: { kind: "boolean" as const, label: "_", default: false } } as const;
type S = SettingsOf<typeof settings>;
export const stalactitesPatPlugin: GamePlugin<StalactitesPatState, StalactitesPatAction, typeof settings> = {
  id: "stalactites-pat",
  title: "Stalactites Patience",
  category: "solitaire",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Patience variant of Stalactites.",
  howToPlay: "Patience variant of Stalactites. Use drag-and-drop or click a card to auto-move it to the best legal destination. The Auto-move button finishes the foundations once the board is solved.",
  settings,
  initialState: (seed: number, s: S) => initialState(seed, s as StalactitesPatSettings),
  reducer,
  isTerminal,
  component: StalactitesPatGame,
};
