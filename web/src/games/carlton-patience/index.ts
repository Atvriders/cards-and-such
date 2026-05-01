import type { GamePlugin } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { CarltonPatienceState, CarltonPatienceAction, CarltonPatienceSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { CarltonPatienceGame } from "./Game.js";

const settings = { _dummy: { kind: "boolean" as const, label: "_", default: false } } as const;
type S = SettingsOf<typeof settings>;
export const carltonPatiencePlugin: GamePlugin<CarltonPatienceState, CarltonPatienceAction, typeof settings> = {
  id: "carlton-patience",
  title: "Carlton Patience",
  category: "solitaire",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Twelve fan-piles fed by stock; two-deck.",
  howToPlay: "Twelve fan-piles fed by stock; two-deck. Use drag-and-drop or click a card to auto-move it to the best legal destination. The Auto-move button finishes the foundations once the board is solved.",
  settings,
  initialState: (seed: number, s: S) => initialState(seed, s as CarltonPatienceSettings),
  reducer,
  isTerminal,
  component: CarltonPatienceGame,
};
