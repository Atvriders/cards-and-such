import type { GamePlugin } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { ParallelsState, ParallelsAction, ParallelsSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { ParallelsGame } from "./Game.js";

const settings = { _dummy: { kind: "boolean" as const, label: "_", default: false } } as const;
type S = SettingsOf<typeof settings>;
export const parallelsPlugin: GamePlugin<ParallelsState, ParallelsAction, typeof settings> = {
  id: "parallels",
  title: "Parallels",
  category: "solitaire",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Parallels — two-deck row variant.",
  howToPlay: "Parallels — two-deck row variant. Use drag-and-drop or click a card to auto-move it to the best legal destination. The Auto-move button finishes the foundations once the board is solved.",
  settings,
  initialState: (seed: number, s: S) => initialState(seed, s as ParallelsSettings),
  reducer,
  isTerminal,
  component: ParallelsGame,
};
