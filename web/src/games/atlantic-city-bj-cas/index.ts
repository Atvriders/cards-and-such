import type { GamePlugin, SettingsOf } from "../../platform/game-plugin/types.js";
import type { AtlanticCityBjCasState, AtlanticCityBjCasAction, AtlanticCityBjCasSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { AtlanticCityBjCasGame } from "./Game.js";
const settings = { dummy: { kind: "boolean" as const, label: "dummy", default: false } } as const;
type S = SettingsOf<typeof settings>;
export const atlanticCityBjCasPlugin: GamePlugin<AtlanticCityBjCasState, AtlanticCityBjCasAction, typeof settings> = {
  id: "atlantic-city-bj-cas", title: "Atlantic City Blackjack", category: "cards",
  players: { min: 1, max: 1, multiplayer: false },
  description: "AC rule-set Blackjack.",
  howToPlay: "Atlantic City Blackjack is the standard Blackjack rule-set in Atlantic City casinos. Key features: dealer stands on soft seventeen, double after split allowed, late surrender allowed, and Blackjack pays 3:2.\n\nIn this single-player version you play fifteen rounds against the dealer. Each round press Play to deal. Choose hit, stand, double, split, or surrender. The dealer plays standard Atlantic City rules and pays accordingly.\n\nA standard win pays twenty; a Blackjack pays thirty (3:2); a successful surrender returns ten (half). A strong total across fifteen rounds is around two hundred and fifty points. The house edge with optimal basic strategy is roughly 0.36%.\n\nAtlantic City Blackjack rules were codified by the New Jersey Casino Control Commission in 1978 when AC casinos opened. The rules are slightly more player-friendly than the Las Vegas Strip variant due to the late-surrender option. Press Play to play the next AC hand.",
  settings,
  initialState: (seed: number, s: S) => initialState(seed, s as AtlanticCityBjCasSettings),
  reducer, isTerminal, component: AtlanticCityBjCasGame,
};
