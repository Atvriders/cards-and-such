import type { GamePlugin } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { GState, GAction } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { ShedRummyRGame } from "./Game.js";
const settings = { dummy: { kind: "boolean" as const, label: "dummy", default: false } } as const;
type S = SettingsOf<typeof settings>;
export const shedRummyRPlugin: GamePlugin<GState, GAction, typeof settings> = {
  id: "shed-rummy-r", title: "Shed Rummy", category: "cards",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Shedding-rummy hybrid where finishing your hand is paramount.",
  howToPlay: "Shed Rummy is a hybrid where the rummy melding system is married to a shedding goal: your priority is to empty your hand. Five rounds are played; each round you draw seven cards and the engine auto-melds the best sets and runs available.\n\nA set is three or more matching ranks; a run is three or more consecutive same-suit cards. Each meld locks in twenty base points plus five per card past three. Cards left after melding form deadwood — aces one, face cards ten, others their pip value — and bare hands score only a tiny consolation.\n\nGoing out — when the meld covers your entire hand and deadwood drops to zero — adds the Shed Rummy bonus of twenty-five. The shedding angle means low-deadwood hands feel like victories even when point totals stay modest. Across five rounds, expected totals range fifty to one-fifty. Click 'Auto-score' to lock the round; 'Next' deals the following hand.",
  settings,
  initialState: (seed: number, _s: S) => initialState(seed, { dummy: false }),
  reducer, isTerminal, component: ShedRummyRGame,
};
