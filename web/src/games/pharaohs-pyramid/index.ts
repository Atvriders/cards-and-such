import type { GamePlugin } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { PharaohsPyramidState, PharaohsPyramidAction, PharaohsPyramidSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { PharaohsPyramidGame } from "./Game.js";

const settings = { _dummy: { kind: "boolean" as const, label: "_", default: false } } as const;
type S = SettingsOf<typeof settings>;
export const pharaohsPyramidPlugin: GamePlugin<PharaohsPyramidState, PharaohsPyramidAction, typeof settings> = {
  id: "pharaohs-pyramid",
  title: "Pharaoh's Pyramid",
  category: "solitaire",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Pyramid with one redeal.",
  howToPlay: "Pyramid with one redeal. Click a card to select it, then click another that pairs with it to sum thirteen — Kings drop alone. Use the stock when the pyramid stalls.",
  settings,
  initialState: (seed: number, s: S) => initialState(seed, s as PharaohsPyramidSettings),
  reducer,
  isTerminal,
  component: PharaohsPyramidGame,
};
