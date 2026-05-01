import type { GamePlugin } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { BlackWidowState, BlackWidowAction, BlackWidowSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { BlackWidowGame } from "./Game.js";

const settings = { _dummy: { kind: "boolean" as const, label: "_", default: false } } as const;
type S = SettingsOf<typeof settings>;
export const blackWidowPlugin: GamePlugin<BlackWidowState, BlackWidowAction, typeof settings> = {
  id: "black-widow",
  title: "Black Widow",
  category: "solitaire",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Spider variant: ten columns, any-suit packing.",
  howToPlay: "Spider variant: ten columns, any-suit packing. Use drag-and-drop or click a card to auto-move it to the best legal destination. The Auto-move button finishes the foundations once the board is solved.",
  settings,
  initialState: (seed: number, s: S) => initialState(seed, s as BlackWidowSettings),
  reducer,
  isTerminal,
  component: BlackWidowGame,
};
