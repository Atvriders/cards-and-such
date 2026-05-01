import type { GamePlugin } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { QuadrupleAllianceState, QuadrupleAllianceAction, QuadrupleAllianceSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { QuadrupleAllianceGame } from "./Game.js";

const settings = { _dummy: { kind: "boolean" as const, label: "_", default: false } } as const;
type S = SettingsOf<typeof settings>;
export const quadrupleAlliancePlugin: GamePlugin<QuadrupleAllianceState, QuadrupleAllianceAction, typeof settings> = {
  id: "quadruple-alliance",
  title: "Quadruple Alliance",
  category: "solitaire",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Two-deck Quadruple Alliance — eight 4-card columns.",
  howToPlay: "Two-deck Quadruple Alliance — eight 4-card columns. Use drag-and-drop or click a card to auto-move it to the best legal destination. The Auto-move button finishes the foundations once the board is solved.",
  settings,
  initialState: (seed: number, s: S) => initialState(seed, s as QuadrupleAllianceSettings),
  reducer,
  isTerminal,
  component: QuadrupleAllianceGame,
};
