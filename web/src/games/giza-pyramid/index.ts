import type { GamePlugin } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { GizaPyramidState, GizaPyramidAction, GizaPyramidSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { GizaPyramidGame } from "./Game.js";

const settings = { _dummy: { kind: "boolean" as const, label: "_", default: false } } as const;
type S = SettingsOf<typeof settings>;
export const gizaPyramidPlugin: GamePlugin<GizaPyramidState, GizaPyramidAction, typeof settings> = {
  id: "giza-pyramid",
  title: "Giza Pyramid",
  category: "solitaire",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Giza Pyramid — single shot through the stock.",
  howToPlay: "Giza Pyramid — single shot through the stock. Click a card to select it, then click another that pairs with it to sum thirteen — Kings drop alone. Use the stock when the pyramid stalls.",
  settings,
  initialState: (seed: number, s: S) => initialState(seed, s as GizaPyramidSettings),
  reducer,
  isTerminal,
  component: GizaPyramidGame,
};
