import type { GamePlugin } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { ApophisState, ApophisAction, ApophisSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { ApophisGame } from "./Game.js";

const settings = { _dummy: { kind: "boolean" as const, label: "_", default: false } } as const;
type S = SettingsOf<typeof settings>;
export const apophisPlugin: GamePlugin<ApophisState, ApophisAction, typeof settings> = {
  id: "apophis",
  title: "Apophis",
  category: "solitaire",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Apophis — pyramid with two redeals through the stock.",
  howToPlay: "Apophis — pyramid with two redeals through the stock. Click a card to select it, then click another that pairs with it to sum thirteen — Kings drop alone. Use the stock when the pyramid stalls.",
  settings,
  initialState: (seed: number, s: S) => initialState(seed, s as ApophisSettings),
  reducer,
  isTerminal,
  component: ApophisGame,
};
