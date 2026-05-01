import type { GamePlugin } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { MethuselahState, MethuselahAction, MethuselahSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { MethuselahGame } from "./Game.js";

const settings = { _dummy: { kind: "boolean" as const, label: "_", default: false } } as const;
type S = SettingsOf<typeof settings>;
export const methuselahPlugin: GamePlugin<MethuselahState, MethuselahAction, typeof settings> = {
  id: "methuselah",
  title: "Methuselah",
  category: "solitaire",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Long-life Klondike-style with no redeals; one shot through stock.",
  howToPlay: "Long-life Klondike-style with no redeals; one shot through stock. Use drag-and-drop or click a card to auto-move it to the best legal destination. The Auto-move button finishes the foundations once the board is solved.",
  settings,
  initialState: (seed: number, s: S) => initialState(seed, s as MethuselahSettings),
  reducer,
  isTerminal,
  component: MethuselahGame,
};
