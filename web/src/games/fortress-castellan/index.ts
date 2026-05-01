import type { GamePlugin } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { FortressCastellanState, FortressCastellanAction, FortressCastellanSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { FortressCastellanGame } from "./Game.js";

const settings = { _dummy: { kind: "boolean" as const, label: "_", default: false } } as const;
type S = SettingsOf<typeof settings>;
export const fortressCastellanPlugin: GamePlugin<FortressCastellanState, FortressCastellanAction, typeof settings> = {
  id: "fortress-castellan",
  title: "Fortress (Castellan)",
  category: "solitaire",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Fortress / Castellan — ten fans, build down by suit.",
  howToPlay: "Fortress / Castellan — ten fans, build down by suit. Use drag-and-drop or click a card to auto-move it to the best legal destination. The Auto-move button finishes the foundations once the board is solved.",
  settings,
  initialState: (seed: number, s: S) => initialState(seed, s as FortressCastellanSettings),
  reducer,
  isTerminal,
  component: FortressCastellanGame,
};
