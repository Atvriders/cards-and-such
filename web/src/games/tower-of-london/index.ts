import type { GamePlugin } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { TowerOfLondonState, TowerOfLondonAction, TowerOfLondonSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { TowerOfLondonGame } from "./Game.js";

const settings = { _dummy: { kind: "boolean" as const, label: "_", default: false } } as const;
type S = SettingsOf<typeof settings>;
export const towerOfLondonPlugin: GamePlugin<TowerOfLondonState, TowerOfLondonAction, typeof settings> = {
  id: "tower-of-london",
  title: "Tower of London",
  category: "solitaire",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Eight columns, any-suit descending tableau, single deck.",
  howToPlay: "Eight columns, any-suit descending tableau, single deck. Use drag-and-drop or click a card to auto-move it to the best legal destination. The Auto-move button finishes the foundations once the board is solved.",
  settings,
  initialState: (seed: number, s: S) => initialState(seed, s as TowerOfLondonSettings),
  reducer,
  isTerminal,
  component: TowerOfLondonGame,
};
