import type { GamePlugin } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { PyramidSolitaireClassicState, PyramidSolitaireClassicAction, PyramidSolitaireClassicSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { PyramidSolitaireClassicGame } from "./Game.js";

const settings = { _dummy: { kind: "boolean" as const, label: "_", default: false } } as const;
type S = SettingsOf<typeof settings>;
export const pyramidSolitaireClassicPlugin: GamePlugin<PyramidSolitaireClassicState, PyramidSolitaireClassicAction, typeof settings> = {
  id: "pyramid-solitaire-classic",
  title: "Pyramid Solitaire Classic",
  category: "solitaire",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Classic Pyramid Solitaire — pair to thirteen, drop Kings alone.",
  howToPlay: "Classic Pyramid Solitaire — pair to thirteen, drop Kings alone. Click a card to select it, then click another that pairs with it to sum thirteen — Kings drop alone. Use the stock when the pyramid stalls.",
  settings,
  initialState: (seed: number, s: S) => initialState(seed, s as PyramidSolitaireClassicSettings),
  reducer,
  isTerminal,
  component: PyramidSolitaireClassicGame,
};
