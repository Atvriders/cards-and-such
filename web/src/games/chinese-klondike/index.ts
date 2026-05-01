import type { GamePlugin } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { ChineseKlondikeState, ChineseKlondikeAction, ChineseKlondikeSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { ChineseKlondikeGame } from "./Game.js";

const settings = { _dummy: { kind: "boolean" as const, label: "_", default: false } } as const;
type S = SettingsOf<typeof settings>;
export const chineseKlondikePlugin: GamePlugin<ChineseKlondikeState, ChineseKlondikeAction, typeof settings> = {
  id: "chinese-klondike",
  title: "Chinese Klondike",
  category: "solitaire",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Klondike with 3-card draw and capped redeals.",
  howToPlay: "Klondike with 3-card draw and capped redeals. Use drag-and-drop or click a card to auto-move it to the best legal destination. The Auto-move button finishes the foundations once the board is solved.",
  settings,
  initialState: (seed: number, s: S) => initialState(seed, s as ChineseKlondikeSettings),
  reducer,
  isTerminal,
  component: ChineseKlondikeGame,
};
