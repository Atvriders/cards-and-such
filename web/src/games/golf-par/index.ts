import type { GamePlugin } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { GolfParState, GolfParAction, GolfParSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { GolfParGame } from "./Game.js";

const settings = { _dummy: { kind: "boolean" as const, label: "_", default: false } } as const;
type S = SettingsOf<typeof settings>;
export const golfParPlugin: GamePlugin<GolfParState, GolfParAction, typeof settings> = {
  id: "golf-par",
  title: "Golf (Par)",
  category: "solitaire",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Par Golf — wrap-around K↔A allowed.",
  howToPlay: "Par Golf — wrap-around K↔A allowed. Click any available column-top whose rank is one above or below the waste top to play it; draw from the stock when the board stalls.",
  settings,
  initialState: (seed: number, s: S) => initialState(seed, s as GolfParSettings),
  reducer,
  isTerminal,
  component: GolfParGame,
};
