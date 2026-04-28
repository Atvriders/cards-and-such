import type { GamePlugin, SettingsOf } from "../../platform/game-plugin/types.js";
import type { CalicoQuiltState, CalicoQuiltAction, CalicoQuiltSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { CalicoQuiltGame } from "./Game.js";
const settings = { dummy: { kind: "boolean" as const, label: "dummy", default: false } } as const;
type S = SettingsOf<typeof settings>;
export const calicoQuiltPlugin: GamePlugin<CalicoQuiltState, CalicoQuiltAction, typeof settings> = {
  id: "calico-quilt",
  title: "Calico Quilt",
  category: "board",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Pattern-and-color quilt tile placement on a 5x5 grid.",
  howToPlay: `Calico is a quilt-making game where you match patterns and colors. In this adaptation you place 18 randomly-drawn patches on a 5x5 grid (25 cells; you'll fill 18 of them). Each patch has both a color (one of three: red, blue, green) and a pattern (one of three: dots, stripes, plaid).

Click any empty cell to place the next patch.

Scoring (at end):
• Each adjacent pair of patches sharing a COLOR: +2 points.
• Each adjacent pair of patches sharing a PATTERN: +2 points.
• A patch that matches both color AND pattern with at least 1 neighbor (any of them): +3 bonus per such patch.
• Each cluster of 3+ same-color patches (orthogonally connected): +6 bonus per cluster.
• Each cluster of 3+ same-pattern patches: +6 bonus per cluster.

Group by color OR pattern, whichever your random draws favor. Don't waste effort on both axes — focus on one. The maximum score on a perfect Calico quilt is around 70; a strong run lands at 35-50.`,
  settings,
  initialState: (seed: number, s: S) => initialState(seed, s as CalicoQuiltSettings),
  reducer,
  isTerminal,
  component: CalicoQuiltGame,
};
