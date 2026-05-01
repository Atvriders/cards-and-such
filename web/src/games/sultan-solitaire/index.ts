import type { GamePlugin } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { SultanSolitaireState, SultanSolitaireAction, SultanSolitaireSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { SultanSolitaireGame } from "./Game.js";

const settings = { _dummy: { kind: "boolean" as const, label: "_", default: false } } as const;
type S = SettingsOf<typeof settings>;
export const sultanSolitairePlugin: GamePlugin<SultanSolitaireState, SultanSolitaireAction, typeof settings> = {
  id: "sultan-solitaire",
  title: "Sultan Solitaire",
  category: "solitaire",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Sultan — two-deck eight-pile variant.",
  howToPlay: "Sultan — two-deck eight-pile variant. Use drag-and-drop or click a card to auto-move it to the best legal destination. The Auto-move button finishes the foundations once the board is solved.",
  settings,
  initialState: (seed: number, s: S) => initialState(seed, s as SultanSolitaireSettings),
  reducer,
  isTerminal,
  component: SultanSolitaireGame,
};
