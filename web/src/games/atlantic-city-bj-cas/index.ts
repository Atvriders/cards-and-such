import type { GamePlugin, SettingsOf } from "../../platform/game-plugin/types.js";
import type { AtlanticCityBjCasState, AtlanticCityBjCasAction, AtlanticCityBjCasSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { AtlanticCityBjCasGame } from "./Game.js";
const settings = { dummy: { kind: "boolean" as const, label: "dummy", default: false } } as const;
type S = SettingsOf<typeof settings>;
export const ac-bj-cPlugin: GamePlugin<AtlanticCityBjCasState, AtlanticCityBjCasAction, typeof settings> = {
  id: "atlantic-city-bj-cas", title: "Atlantic City Blackjack", category: "cards",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Atlantic City Blackjack — late surrender allowed.",
  howToPlay: "Atlantic City Blackjack — late surrender allowed. Hit to draw, Stand to stop. Bust on 22+ = lose. Doubles down on first two cards. Stand on 17+. Blackjack pays 1.5:1.",
  settings,
  initialState: (seed: number, _s: S) => initialState(seed, _s as AtlanticCityBjCasSettings),
  reducer, isTerminal, component: AtlanticCityBjCasGame,
};
