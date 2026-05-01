import type { GamePlugin } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { NapoleonStHelenaState, NapoleonStHelenaAction, NapoleonStHelenaSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { NapoleonStHelenaGame } from "./Game.js";

const settings = { _dummy: { kind: "boolean" as const, label: "_", default: false } } as const;
type S = SettingsOf<typeof settings>;
export const napoleonStHelenaPlugin: GamePlugin<NapoleonStHelenaState, NapoleonStHelenaAction, typeof settings> = {
  id: "napoleon-st-helena",
  title: "Napoleon at St. Helena",
  category: "solitaire",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Two-deck Napoleon: ten 4-card columns, build by suit.",
  howToPlay: "Two-deck Napoleon: ten 4-card columns, build by suit. Use drag-and-drop or click a card to auto-move it to the best legal destination. The Auto-move button finishes the foundations once the board is solved.",
  settings,
  initialState: (seed: number, s: S) => initialState(seed, s as NapoleonStHelenaSettings),
  reducer,
  isTerminal,
  component: NapoleonStHelenaGame,
};
