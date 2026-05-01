import type { GamePlugin } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { RaglanPatienceState, RaglanPatienceAction, RaglanPatienceSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { RaglanPatienceGame } from "./Game.js";

const settings = { _dummy: { kind: "boolean" as const, label: "_", default: false } } as const;
type S = SettingsOf<typeof settings>;
export const raglanPatiencePlugin: GamePlugin<RaglanPatienceState, RaglanPatienceAction, typeof settings> = {
  id: "raglan-patience",
  title: "Raglan Patience",
  category: "solitaire",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Raglan: nine fans of five — fully open layout.",
  howToPlay: "Raglan: nine fans of five — fully open layout. Use drag-and-drop or click a card to auto-move it to the best legal destination. The Auto-move button finishes the foundations once the board is solved.",
  settings,
  initialState: (seed: number, s: S) => initialState(seed, s as RaglanPatienceSettings),
  reducer,
  isTerminal,
  component: RaglanPatienceGame,
};
