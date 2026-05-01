import type { GamePlugin } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { TowerLondonSoliState, TowerLondonSoliAction, TowerLondonSoliSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { TowerLondonSoliGame } from "./Game.js";

const settings = { _dummy: { kind: "boolean" as const, label: "_", default: false } } as const;
type S = SettingsOf<typeof settings>;
export const towerLondonSoliPlugin: GamePlugin<TowerLondonSoliState, TowerLondonSoliAction, typeof settings> = {
  id: "tower-london-soli",
  title: "Tower London",
  category: "solitaire",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Tower London variant — same engine, same-suit allowed packing.",
  howToPlay: "Tower London variant — same engine, same-suit allowed packing. Use drag-and-drop or click a card to auto-move it to the best legal destination. The Auto-move button finishes the foundations once the board is solved.",
  settings,
  initialState: (seed: number, s: S) => initialState(seed, s as TowerLondonSoliSettings),
  reducer,
  isTerminal,
  component: TowerLondonSoliGame,
};
