import type { GamePlugin } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { QuadrupleAlliancePatState, QuadrupleAlliancePatAction, QuadrupleAlliancePatSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { QuadrupleAlliancePatGame } from "./Game.js";

const settings = { _dummy: { kind: "boolean" as const, label: "_", default: false } } as const;
type S = SettingsOf<typeof settings>;
export const quadrupleAlliancePatPlugin: GamePlugin<QuadrupleAlliancePatState, QuadrupleAlliancePatAction, typeof settings> = {
  id: "quadruple-alliance-pat",
  title: "Quadruple Alliance Patience",
  category: "solitaire",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Patience variant of Quadruple Alliance.",
  howToPlay: "Patience variant of Quadruple Alliance. Use drag-and-drop or click a card to auto-move it to the best legal destination. The Auto-move button finishes the foundations once the board is solved.",
  settings,
  initialState: (seed: number, s: S) => initialState(seed, s as QuadrupleAlliancePatSettings),
  reducer,
  isTerminal,
  component: QuadrupleAlliancePatGame,
};
