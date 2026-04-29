import type { GamePlugin } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { GState, GAction } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { RummyTilesRGame } from "./Game.js";
const settings = { dummy: { kind: "boolean" as const, label: "dummy", default: false } } as const;
type S = SettingsOf<typeof settings>;
export const rummyTilesRPlugin: GamePlugin<GState, GAction, typeof settings> = {
  id: "rummy-tiles-r", title: "Rummy Tiles", category: "cards",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Generic Rummikub-like tile rummy played with cards.",
  howToPlay: "Rummy Tiles approximates the feel of Rummikub-style tile games using a standard card deck. Sets and runs work the same as in tile rummy: groups (three or more cards of equal rank) and runs (three or more consecutive same-suit cards). Five rounds are played, each starting with a nine-card 'rack'.\n\nThe engine auto-arranges your rack into the highest-scoring meld combination. Each meld scores twenty base points plus five for every card past three. Cards left outside any meld form leftover tiles — aces one, face cards ten, others pip value — and contribute only a small consolation when no melds form.\n\nGoing out clean (zero leftovers) adds twenty-five-point bonus. Across five rounds, expected totals run sixty to one-seventy. Click 'Auto-score' each round and 'Next' to deal. Rummy Tiles rewards racks where ranks bunch in threes or fours, and where consecutive same-suit cards form long runs — much like the satisfying tile chains of the original game.",
  settings,
  initialState: (seed: number, _s: S) => initialState(seed, { dummy: false }),
  reducer, isTerminal, component: RummyTilesRGame,
};
