import type { GamePlugin } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { WillOTheWispState, WillOTheWispAction, WillOTheWispSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { WillOTheWispGame } from "./Game.js";

const settings = { _dummy: { kind: "boolean" as const, label: "_", default: false } } as const;
type S = SettingsOf<typeof settings>;
export const willOTheWispPlugin: GamePlugin<WillOTheWispState, WillOTheWispAction, typeof settings> = {
  id: "will-o-the-wisp",
  title: "Will O' the Wisp",
  category: "solitaire",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Will O' the Wisp variant.",
  howToPlay: "Will O' the Wisp variant. Use drag-and-drop or click a card to auto-move it to the best legal destination. The Auto-move button finishes the foundations once the board is solved.",
  settings,
  initialState: (seed: number, s: S) => initialState(seed, s as WillOTheWispSettings),
  reducer,
  isTerminal,
  component: WillOTheWispGame,
};
