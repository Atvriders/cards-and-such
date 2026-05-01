import type { GamePlugin } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { WesthavenState, WesthavenAction, WesthavenSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { WesthavenGame } from "./Game.js";

const settings = { _dummy: { kind: "boolean" as const, label: "_", default: false } } as const;
type S = SettingsOf<typeof settings>;
export const westhavenPlugin: GamePlugin<WesthavenState, WesthavenAction, typeof settings> = {
  id: "westhaven",
  title: "Westhaven",
  category: "solitaire",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Westhaven — ten columns of three, top face-up.",
  howToPlay: "Westhaven — ten columns of three, top face-up. Use drag-and-drop or click a card to auto-move it to the best legal destination. The Auto-move button finishes the foundations once the board is solved.",
  settings,
  initialState: (seed: number, s: S) => initialState(seed, s as WesthavenSettings),
  reducer,
  isTerminal,
  component: WesthavenGame,
};
