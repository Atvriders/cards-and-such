import type { GamePlugin } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { GState, GAction } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { PapluRGame } from "./Game.js";
const settings = { dummy: { kind: "boolean" as const, label: "dummy", default: false } } as const;
type S = SettingsOf<typeof settings>;
export const papluRPlugin: GamePlugin<GState, GAction, typeof settings> = {
  id: "paplu-r", title: "Paplu", category: "cards",
  players: { min: 1, max: 1, multiplayer: false },
  description: "North-Indian 13-card style Rummy adapted to nine-card play.",
  howToPlay: "Paplu is the North-Indian rummy game traditionally played with thirteen cards and jokers as wilds. This simulator uses a streamlined nine-card hand for faster rounds while preserving the core meld-and-score flow. Five rounds are played; each round the engine auto-melds your hand into sets and runs.\n\nA set is three or more equal ranks; a run is three or more consecutive same-suit cards. Each meld scores twenty base points plus five for every card past three. Cards remaining outside melds form deadwood — aces one, face cards ten, others pip value. Bare hands earn only a small consolation of a point or two.\n\nGoing out clean (no deadwood) adds twenty-five-point Paplu-out bonus. Across five rounds, expected totals run sixty to one-seventy. Click 'Auto-score' each round and 'Next' to deal again. Paplu rewards seeds with strong rank clusters and adjacent same-suit cards — exactly the kind of hand experienced Indian rummy players angle for.",
  settings,
  initialState: (seed: number, _s: S) => initialState(seed, { dummy: false }),
  reducer, isTerminal, component: PapluRGame,
};
