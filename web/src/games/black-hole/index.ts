import type { GamePlugin } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { BlackHoleState, BlackHoleAction, BlackHoleSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { BlackHoleGame } from "./Game.js";

const settings = { _dummy: { kind: "boolean" as const, label: "_", default: false } } as const;
type S = SettingsOf<typeof settings>;
export const blackHoleSolPlugin: GamePlugin<BlackHoleState, BlackHoleAction, typeof settings> = {
  id: "black-hole",
  title: "Black Hole",
  category: "solitaire",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Black Hole — sweep all 51 cards onto the central Ace by rank-adjacency.",
  howToPlay: "Black Hole — sweep all 51 cards onto the central Ace by rank-adjacency. Click any available column-top whose rank is one above or below the waste top to play it; draw from the stock when the board stalls.",
  settings,
  initialState: (seed: number, s: S) => initialState(seed, s as BlackHoleSettings),
  reducer,
  isTerminal,
  component: BlackHoleGame,
};
