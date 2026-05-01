import type { GamePlugin } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { WaspPatState, WaspPatAction, WaspPatSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { WaspPatGame } from "./Game.js";

const settings = { _dummy: { kind: "boolean" as const, label: "_", default: false } } as const;
type S = SettingsOf<typeof settings>;
export const waspPatPlugin: GamePlugin<WaspPatState, WaspPatAction, typeof settings> = {
  id: "wasp-pat",
  title: "Wasp Patience",
  category: "solitaire",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Patience variant of Wasp.",
  howToPlay: "Patience variant of Wasp. Use drag-and-drop or click a card to auto-move it to the best legal destination. The Auto-move button finishes the foundations once the board is solved.",
  settings,
  initialState: (seed: number, s: S) => initialState(seed, s as WaspPatSettings),
  reducer,
  isTerminal,
  component: WaspPatGame,
};
