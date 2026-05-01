import type { GamePlugin } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { AlaskaSolitaireState, AlaskaSolitaireAction, AlaskaSolitaireSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { AlaskaSolitaireGame } from "./Game.js";

const settings = { _dummy: { kind: "boolean" as const, label: "_", default: false } } as const;
type S = SettingsOf<typeof settings>;
export const alaskaSolitairePlugin: GamePlugin<AlaskaSolitaireState, AlaskaSolitaireAction, typeof settings> = {
  id: "alaska-solitaire",
  title: "Alaska Solitaire",
  category: "solitaire",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Alaska — same-suit Yukon variant.",
  howToPlay: "Alaska — same-suit Yukon variant. Use drag-and-drop or click a card to auto-move it to the best legal destination. The Auto-move button finishes the foundations once the board is solved.",
  settings,
  initialState: (seed: number, s: S) => initialState(seed, s as AlaskaSolitaireSettings),
  reducer,
  isTerminal,
  component: AlaskaSolitaireGame,
};
