import type { GamePlugin } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { StonewallState, StonewallAction, StonewallSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { StonewallGame } from "./Game.js";

const settings = { _dummy: { kind: "boolean" as const, label: "_", default: false } } as const;
type S = SettingsOf<typeof settings>;
export const stonewallPlugin: GamePlugin<StonewallState, StonewallAction, typeof settings> = {
  id: "stonewall",
  title: "Stonewall",
  category: "solitaire",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Stonewall: six fans, no stock — every card visible from the start.",
  howToPlay: "Stonewall: six fans, no stock — every card visible from the start. Use drag-and-drop or click a card to auto-move it to the best legal destination. The Auto-move button finishes the foundations once the board is solved.",
  settings,
  initialState: (seed: number, s: S) => initialState(seed, s as StonewallSettings),
  reducer,
  isTerminal,
  component: StonewallGame,
};
