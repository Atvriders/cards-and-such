import type { GamePlugin } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { GolfParVariantState, GolfParVariantAction, GolfParVariantSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { GolfParVariantGame } from "./Game.js";

const settings = { _dummy: { kind: "boolean" as const, label: "_", default: false } } as const;
type S = SettingsOf<typeof settings>;
export const golfParVariantPlugin: GamePlugin<GolfParVariantState, GolfParVariantAction, typeof settings> = {
  id: "golf-par-variant",
  title: "Golf (Par Variant)",
  category: "solitaire",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Par Golf with a single redeal cycle.",
  howToPlay: "Par Golf with a single redeal cycle. Click any available column-top whose rank is one above or below the waste top to play it; draw from the stock when the board stalls.",
  settings,
  initialState: (seed: number, s: S) => initialState(seed, s as GolfParVariantSettings),
  reducer,
  isTerminal,
  component: GolfParVariantGame,
};
