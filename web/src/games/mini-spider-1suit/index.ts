import type { GamePlugin } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { MiniSpider1suitState, MiniSpider1suitAction, MiniSpider1suitSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { MiniSpider1suitGame } from "./Game.js";

const settings = { _dummy: { kind: "boolean" as const, label: "_", default: false } } as const;
type S = SettingsOf<typeof settings>;
export const miniSpider1suitPlugin: GamePlugin<MiniSpider1suitState, MiniSpider1suitAction, typeof settings> = {
  id: "mini-spider-1suit",
  title: "Mini Spider (1-suit)",
  category: "solitaire",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Mini Spider — single deck, six columns, suit packing.",
  howToPlay: "Mini Spider — single deck, six columns, suit packing. Use drag-and-drop or click a card to auto-move it to the best legal destination. The Auto-move button finishes the foundations once the board is solved.",
  settings,
  initialState: (seed: number, s: S) => initialState(seed, s as MiniSpider1suitSettings),
  reducer,
  isTerminal,
  component: MiniSpider1suitGame,
};
