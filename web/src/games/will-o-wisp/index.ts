import type { GamePlugin } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { WillOWispState, WillOWispAction, WillOWispSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { WillOWispGame } from "./Game.js";

const settings = { _dummy: { kind: "boolean" as const, label: "_", default: false } } as const;
type S = SettingsOf<typeof settings>;
export const willOWispPlugin: GamePlugin<WillOWispState, WillOWispAction, typeof settings> = {
  id: "will-o-wisp",
  title: "Will O' the Wisp",
  category: "solitaire",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Will O' the Wisp — seven columns of three.",
  howToPlay: "Will O' the Wisp — seven columns of three. Use drag-and-drop or click a card to auto-move it to the best legal destination. The Auto-move button finishes the foundations once the board is solved.",
  settings,
  initialState: (seed: number, s: S) => initialState(seed, s as WillOWispSettings),
  reducer,
  isTerminal,
  component: WillOWispGame,
};
