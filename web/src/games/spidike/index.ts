import type { GamePlugin } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { SpidikeState, SpidikeAction, SpidikeSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { SpidikeGame } from "./Game.js";

const settings = { _dummy: { kind: "boolean" as const, label: "_", default: false } } as const;
type S = SettingsOf<typeof settings>;
export const spidikePlugin: GamePlugin<SpidikeState, SpidikeAction, typeof settings> = {
  id: "spidike",
  title: "Spidike",
  category: "solitaire",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Spider × Klondike hybrid — two decks, eight columns.",
  howToPlay: "Spider × Klondike hybrid — two decks, eight columns. Use drag-and-drop or click a card to auto-move it to the best legal destination. The Auto-move button finishes the foundations once the board is solved.",
  settings,
  initialState: (seed: number, s: S) => initialState(seed, s as SpidikeSettings),
  reducer,
  isTerminal,
  component: SpidikeGame,
};
