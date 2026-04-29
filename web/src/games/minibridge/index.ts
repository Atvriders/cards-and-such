import type { GamePlugin } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { MinibridgeState, MinibridgeAction, MinibridgeSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { MinibridgeGame } from "./Game.js";
const settings = { dummy: { kind: "boolean" as const, label: "dummy", default: false } } as const;
type S = SettingsOf<typeof settings>;
export const minibridgePlugin: GamePlugin<MinibridgeState, MinibridgeAction, typeof settings> = {
  id: "minibridge", title: "Minibridge", category: "cards",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Simplified bridge for teaching — no auction, just card play.",
  howToPlay: "Minibridge is the streamlined teaching version of Contract Bridge — designed to introduce the trick-play mechanics without the complexity of an auction. Each player receives thirteen cards. After a brief evaluation phase where partnerships announce their high-card-point totals, the side with more points becomes declarer, picks trump (or no-trump), and dummy lays cards face-up. Play proceeds normally: follow suit if able, highest of led suit (or trump) wins each trick. The contract level is fixed (typically nine tricks for game). In this CPU duel across six rounds, click Play Round. Strategy: count points carefully (ace = 4, king = 3, queen = 2, jack = 1) and pick trump in the longest combined suit between you and partner. Plan declarer play before the first trick: count winners, identify losers, and decide on a finesse line. Aim for at least four made contracts.",
  settings,
  initialState: (seed: number, s: S) => initialState(seed, s as MinibridgeSettings),
  reducer, isTerminal, component: MinibridgeGame,
};
