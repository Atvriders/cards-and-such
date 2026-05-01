import type { GamePlugin } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { BouquetState, BouquetAction, BouquetSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { BouquetGame } from "./Game.js";

const settings = { _dummy: { kind: "boolean" as const, label: "_", default: false } } as const;
type S = SettingsOf<typeof settings>;
export const bouquetPlugin: GamePlugin<BouquetState, BouquetAction, typeof settings> = {
  id: "bouquet",
  title: "Bouquet",
  category: "solitaire",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Bouquet: two-deck eight-fan layout.",
  howToPlay: "Bouquet: two-deck eight-fan layout. Use drag-and-drop or click a card to auto-move it to the best legal destination. The Auto-move button finishes the foundations once the board is solved.",
  settings,
  initialState: (seed: number, s: S) => initialState(seed, s as BouquetSettings),
  reducer,
  isTerminal,
  component: BouquetGame,
};
