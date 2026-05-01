import type { GamePlugin } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { MiniCanfieldState, MiniCanfieldAction, MiniCanfieldSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { MiniCanfieldGame } from "./Game.js";

const settings = { _dummy: { kind: "boolean" as const, label: "_", default: false } } as const;
type S = SettingsOf<typeof settings>;
export const miniCanfieldPlugin: GamePlugin<MiniCanfieldState, MiniCanfieldAction, typeof settings> = {
  id: "mini-canfield",
  title: "Mini Canfield",
  category: "solitaire",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Compact Canfield with 3-card draw.",
  howToPlay: "Compact Canfield with 3-card draw. Use drag-and-drop or click a card to auto-move it to the best legal destination. The Auto-move button finishes the foundations once the board is solved.",
  settings,
  initialState: (seed: number, s: S) => initialState(seed, s as MiniCanfieldSettings),
  reducer,
  isTerminal,
  component: MiniCanfieldGame,
};
