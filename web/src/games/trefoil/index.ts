import type { GamePlugin } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { TrefoilState, TrefoilAction, TrefoilSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { TrefoilGame } from "./Game.js";

const settings = { _dummy: { kind: "boolean" as const, label: "_", default: false } } as const;
type S = SettingsOf<typeof settings>;
export const trefoilPlugin: GamePlugin<TrefoilState, TrefoilAction, typeof settings> = {
  id: "trefoil",
  title: "Trefoil",
  category: "solitaire",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Match adjacent pairs across a six-row spread.",
  howToPlay: "Match adjacent pairs across a six-row spread. Click a card, then click another that shares its rank. Pairs cancel; clear the board to win.",
  settings,
  initialState: (seed: number, s: S) => initialState(seed, s as TrefoilSettings),
  reducer,
  isTerminal,
  component: TrefoilGame,
};
