import type { GamePlugin } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { PyramidNoRedealState, PyramidNoRedealAction, PyramidNoRedealSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { PyramidNoRedealGame } from "./Game.js";

const settings = { _dummy: { kind: "boolean" as const, label: "_", default: false } } as const;
type S = SettingsOf<typeof settings>;
export const pyramidNoRedealPlugin: GamePlugin<PyramidNoRedealState, PyramidNoRedealAction, typeof settings> = {
  id: "pyramid-no-redeal",
  title: "Pyramid (No Redeal)",
  category: "solitaire",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Pyramid with a single pass through the stock.",
  howToPlay: "Pyramid with a single pass through the stock. Click a card to select it, then click another that pairs with it to sum thirteen — Kings drop alone. Use the stock when the pyramid stalls.",
  settings,
  initialState: (seed: number, s: S) => initialState(seed, s as PyramidNoRedealSettings),
  reducer,
  isTerminal,
  component: PyramidNoRedealGame,
};
