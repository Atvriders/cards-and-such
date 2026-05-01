import type { GamePlugin } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { ToadHoleState, ToadHoleAction, ToadHoleSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { ToadHoleGame } from "./Game.js";

const settings = { _dummy: { kind: "boolean" as const, label: "_", default: false } } as const;
type S = SettingsOf<typeof settings>;
export const toadHolePlugin: GamePlugin<ToadHoleState, ToadHoleAction, typeof settings> = {
  id: "toad-hole",
  title: "Toad in the Hole",
  category: "solitaire",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Two-deck variant: build foundations by suit, eight columns.",
  howToPlay: "Two-deck variant: build foundations by suit, eight columns. Use drag-and-drop or click a card to auto-move it to the best legal destination. The Auto-move button finishes the foundations once the board is solved.",
  settings,
  initialState: (seed: number, s: S) => initialState(seed, s as ToadHoleSettings),
  reducer,
  isTerminal,
  component: ToadHoleGame,
};
