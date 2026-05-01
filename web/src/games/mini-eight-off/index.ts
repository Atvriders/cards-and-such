import type { GamePlugin } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { MiniEightOffState, MiniEightOffAction, MiniEightOffSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { MiniEightOffGame } from "./Game.js";

const settings = { _dummy: { kind: "boolean" as const, label: "_", default: false } } as const;
type S = SettingsOf<typeof settings>;
export const miniEightOffPlugin: GamePlugin<MiniEightOffState, MiniEightOffAction, typeof settings> = {
  id: "mini-eight-off",
  title: "Mini Eight Off",
  category: "solitaire",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Mini Eight Off (FreeCell-cousin) — four columns, suit packing.",
  howToPlay: "Mini Eight Off (FreeCell-cousin) — four columns, suit packing. Use drag-and-drop or click a card to auto-move it to the best legal destination. The Auto-move button finishes the foundations once the board is solved.",
  settings,
  initialState: (seed: number, s: S) => initialState(seed, s as MiniEightOffSettings),
  reducer,
  isTerminal,
  component: MiniEightOffGame,
};
