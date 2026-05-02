import type { GamePlugin, SettingsOf, HintTarget } from "../../platform/game-plugin/types.js";
import type { AtlanticCityBjCasState, AtlanticCityBjCasAction, AtlanticCityBjCasSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { AtlanticCityBjCasGame } from "./Game.js";
const settings = { dummy: { kind: "boolean" as const, label: "dummy", default: false } } as const;
type S = SettingsOf<typeof settings>;
export const atlanticCityBjCasPlugin: GamePlugin<AtlanticCityBjCasState, AtlanticCityBjCasAction, typeof settings> = {
  id: "atlantic-city-bj-cas", title: "Atlantic City Blackjack", category: "cards",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Atlantic City Blackjack — late surrender allowed.",
  howToPlay: "Atlantic City Blackjack — late surrender allowed. Hit to draw, Stand to stop. Bust on 22+ = lose. Doubles down on first two cards. Stand on 17+. Blackjack pays 1.5:1.",
  settings,
  initialState: (seed: number, _s: S) => initialState(seed, _s as AtlanticCityBjCasSettings),
  hint: (state) => {
    if (state.phase === "scored") return { selector: '[data-testid="hint-target-atlantic-city-bj-cas-next"]', pulses: 3 };
    if (state.phase !== "play") return null;
    const total = state.yourTotal;
    if (total < 12) return { selector: '[data-testid="hint-target-atlantic-city-bj-cas-hit"]', pulses: 3 };
    if (total >= 17) return { selector: '[data-testid="hint-target-atlantic-city-bj-cas-stand"]', pulses: 3 };
    return { selector: '[data-testid="hint-target-atlantic-city-bj-cas-hit"]', pulses: 3 };
  },
  reducer, isTerminal, component: AtlanticCityBjCasGame,
};
