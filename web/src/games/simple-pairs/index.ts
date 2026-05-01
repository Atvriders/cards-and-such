import type { GamePlugin } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { SimplePairsState, SimplePairsAction, SimplePairsSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { SimplePairsGame } from "./Game.js";

const settings = { _dummy: { kind: "boolean" as const, label: "_", default: false } } as const;
type S = SettingsOf<typeof settings>;
export const simplePairsPlugin: GamePlugin<SimplePairsState, SimplePairsAction, typeof settings> = {
  id: "simple-pairs",
  title: "Simple Pairs",
  category: "solitaire",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Match same-rank pairs anywhere on the board.",
  howToPlay: "Match same-rank pairs anywhere on the board. Click a card, then click another that shares its rank. Pairs cancel; clear the board to win.",
  settings,
  initialState: (seed: number, s: S) => initialState(seed, s as SimplePairsSettings),
  reducer,
  isTerminal,
  component: SimplePairsGame,
};
