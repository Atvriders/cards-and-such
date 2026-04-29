import type { GamePlugin } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { GState, GAction } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { PinochleRummyRGame } from "./Game.js";
const settings = { dummy: { kind: "boolean" as const, label: "dummy", default: false } } as const;
type S = SettingsOf<typeof settings>;
export const pinochleRummyRPlugin: GamePlugin<GState, GAction, typeof settings> = {
  id: "pinochle-rummy-r", title: "Pinochle Rummy", category: "cards",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Pinochle-deck rummy hybrid with double-card meld scoring.",
  howToPlay: "Pinochle Rummy fuses the meld-based scoring of pinochle with the draw-and-discard structure of rummy. While the simulator uses a standard deck for clarity, scoring favors the high-card combinations characteristic of the pinochle family. Each round you receive nine cards and the engine extracts the best sets and runs.\n\nA set is three or more cards of the same rank — particularly valuable when including face cards. A run is three or more consecutive same-suit cards; in pinochle terms, a marriage (king-queen) hidden inside a run adds extra weight. Each meld here scores twenty base plus five per extra card above three.\n\nFive rounds are played, accumulating points round by round. Deadwood (unmelded leftovers) works against bare hands; going out clean adds twenty-five. Expected totals: ninety to two hundred. Click 'Auto-score' to lock a round and 'Next' to deal again. Pinochle Rummy rewards seeds rich in J-Q-K clusters and tight suit-runs around the high end.",
  settings,
  initialState: (seed: number, _s: S) => initialState(seed, { dummy: false }),
  reducer, isTerminal, component: PinochleRummyRGame,
};
