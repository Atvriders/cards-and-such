import type { GamePlugin } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { MiniTripeaksState, MiniTripeaksAction, MiniTripeaksSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { MiniTripeaksGame } from "./Game.js";

const settings = { _dummy: { kind: "boolean" as const, label: "_", default: false } } as const;
type S = SettingsOf<typeof settings>;
export const miniTripeaksPlugin: GamePlugin<MiniTripeaksState, MiniTripeaksAction, typeof settings> = {
  id: "mini-tripeaks",
  title: "Mini Tri-Peaks",
  category: "solitaire",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Compact tri-peaks with smaller stock.",
  howToPlay: "Compact tri-peaks with smaller stock. Click any available column-top whose rank is one above or below the waste top to play it; draw from the stock when the board stalls.",
  settings,
  initialState: (seed: number, s: S) => initialState(seed, s as MiniTripeaksSettings),
  reducer,
  isTerminal,
  component: MiniTripeaksGame,
};
