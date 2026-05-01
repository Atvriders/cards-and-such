import type { GamePlugin } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { ApophisSoliState, ApophisSoliAction, ApophisSoliSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { ApophisSoliGame } from "./Game.js";

const settings = { _dummy: { kind: "boolean" as const, label: "_", default: false } } as const;
type S = SettingsOf<typeof settings>;
export const apophisSoliPlugin: GamePlugin<ApophisSoliState, ApophisSoliAction, typeof settings> = {
  id: "apophis-soli",
  title: "Apophis Solitaire",
  category: "solitaire",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Apophis variant of Pyramid Solitaire.",
  howToPlay: "Apophis variant of Pyramid Solitaire. Click a card to select it, then click another that pairs with it to sum thirteen — Kings drop alone. Use the stock when the pyramid stalls.",
  settings,
  initialState: (seed: number, s: S) => initialState(seed, s as ApophisSoliSettings),
  reducer,
  isTerminal,
  component: ApophisSoliGame,
};
