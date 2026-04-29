import type { GamePlugin } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { DuplicateBridgeState, DuplicateBridgeAction, DuplicateBridgeSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { DuplicateBridgeGame } from "./Game.js";
const settings = { dummy: { kind: "boolean" as const, label: "dummy", default: false } } as const;
type S = SettingsOf<typeof settings>;
export const duplicateBridgePlugin: GamePlugin<DuplicateBridgeState, DuplicateBridgeAction, typeof settings> = {
  id: "duplicate-bridge", title: "Duplicate Bridge", category: "cards",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Tournament bridge with identical hands across multiple tables.",
  howToPlay: "Duplicate Bridge is the tournament form of Contract Bridge, played by four people but scored against the results other partnerships obtain on the same identical hands. The deal is fixed (boards) so luck is removed — your performance is compared to other pairs holding the same cards. Scoring uses match-points or international match-points (IMPs) rather than rubber points. In this simplified one-on-one CPU duel across six boards, click Play Round and the engine compares your simulated result to a benchmark for that fixed deal. Strategy: in duplicate, overtricks matter more and underbidding is punished. Always evaluate your hand precisely (high-card points plus distribution adjustments) and bid the full value. Defense is critical — every overtrick allowed is a match-point loss. Aim for at least three boards where you out-perform the benchmark for a strong duplicate finish.",
  settings,
  initialState: (seed: number, s: S) => initialState(seed, s as DuplicateBridgeSettings),
  reducer, isTerminal, component: DuplicateBridgeGame,
};
