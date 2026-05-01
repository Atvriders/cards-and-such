import type { GamePlugin } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { LadyOfManorState, LadyOfManorAction, LadyOfManorSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { LadyOfManorGame } from "./Game.js";

const settings = { _dummy: { kind: "boolean" as const, label: "_", default: false } } as const;
type S = SettingsOf<typeof settings>;
export const ladyOfManorPlugin: GamePlugin<LadyOfManorState, LadyOfManorAction, typeof settings> = {
  id: "lady-of-manor",
  title: "Lady of Manor",
  category: "solitaire",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Two-deck Lady of Manor variant.",
  howToPlay: "Two-deck Lady of Manor variant. Use drag-and-drop or click a card to auto-move it to the best legal destination. The Auto-move button finishes the foundations once the board is solved.",
  settings,
  initialState: (seed: number, s: S) => initialState(seed, s as LadyOfManorSettings),
  reducer,
  isTerminal,
  component: LadyOfManorGame,
};
