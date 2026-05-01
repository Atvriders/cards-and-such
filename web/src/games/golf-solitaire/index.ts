import type { GamePlugin } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { GolfSolitaireState, GolfSolitaireAction, GolfSolitaireSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { GolfSolitaireGame } from "./Game.js";

const settings = { _dummy: { kind: "boolean" as const, label: "_", default: false } } as const;
type S = SettingsOf<typeof settings>;
export const golfSolitairePlugin: GamePlugin<GolfSolitaireState, GolfSolitaireAction, typeof settings> = {
  id: "golf-solitaire",
  title: "Golf Solitaire",
  category: "solitaire",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Classic Golf — one less or more than the waste; no recycling.",
  howToPlay: "Classic Golf — one less or more than the waste; no recycling. Click any available column-top whose rank is one above or below the waste top to play it; draw from the stock when the board stalls.",
  settings,
  initialState: (seed: number, s: S) => initialState(seed, s as GolfSolitaireSettings),
  reducer,
  isTerminal,
  component: GolfSolitaireGame,
};
