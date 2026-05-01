import type { GamePlugin } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { MiniYukonState, MiniYukonAction, MiniYukonSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { MiniYukonGame } from "./Game.js";

const settings = { _dummy: { kind: "boolean" as const, label: "_", default: false } } as const;
type S = SettingsOf<typeof settings>;
export const miniYukonPlugin: GamePlugin<MiniYukonState, MiniYukonAction, typeof settings> = {
  id: "mini-yukon",
  title: "Mini Yukon",
  category: "solitaire",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Compact Yukon variant — four columns.",
  howToPlay: "Compact Yukon variant — four columns. Use drag-and-drop or click a card to auto-move it to the best legal destination. The Auto-move button finishes the foundations once the board is solved.",
  settings,
  initialState: (seed: number, s: S) => initialState(seed, s as MiniYukonSettings),
  reducer,
  isTerminal,
  component: MiniYukonGame,
};
