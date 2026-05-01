import type { GamePlugin } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { CrescentSolitaireState, CrescentSolitaireAction, CrescentSolitaireSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { CrescentSolitaireGame } from "./Game.js";

const settings = { _dummy: { kind: "boolean" as const, label: "_", default: false } } as const;
type S = SettingsOf<typeof settings>;
export const crescentSolitairePlugin: GamePlugin<CrescentSolitaireState, CrescentSolitaireAction, typeof settings> = {
  id: "crescent-solitaire",
  title: "Crescent Solitaire",
  category: "solitaire",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Crescent — two-deck arc of 16 fans of six.",
  howToPlay: "Crescent — two-deck arc of 16 fans of six. Use drag-and-drop or click a card to auto-move it to the best legal destination. The Auto-move button finishes the foundations once the board is solved.",
  settings,
  initialState: (seed: number, s: S) => initialState(seed, s as CrescentSolitaireSettings),
  reducer,
  isTerminal,
  component: CrescentSolitaireGame,
};
