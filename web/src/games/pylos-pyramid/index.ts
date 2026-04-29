import type { GamePlugin } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { GameState, GameAction, GameSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { PylosPyramidGame } from "./Game.js";
const settings = { dummy: { kind: "boolean" as const, label: "dummy", default: false } } as const;
type S = SettingsOf<typeof settings>;
export const pylosPyramidPlugin: GamePlugin<GameState, GameAction, typeof settings> = {
  id: "pylos-pyramid",
  title: "Pylos",
  category: "board",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Stack balls in a pyramid — be the one to place the top sphere. Place vs random CPU.",
  howToPlay: "Pylos is a 1994 abstract by David G. Royffe where players take turns placing spheres on a 4x4 grid; once a 2x2 square of spheres is filled, players may stack additional spheres on top, building a pyramid layer by layer. The player who places the final top sphere of the pyramid wins. In this compact placement adaptation, the pyramid concept is simplified into a layered scoring structure.\n\nClick any empty cell to place a P piece. The center cells (rows 1-2, cols 1-2) count as pyramid cells and earn 2 points each; the surrounding cells count as base cells and earn 1 point each. After your turn, a random CPU places a C piece on a random empty cell.\n\nGameplay lasts up to 14 moves or until the board fills. You earn 100 points for ending with higher pyramid-weighted score than the CPU, 25 for a tie, plus the pyramid-weighted score itself. Center cells are doubly valuable, so contest them early — but a center placement is also visible to the CPU, which may by chance also land in the center.",
  settings,
  initialState: (seed: number, s: S) => initialState(seed, s as GameSettings),
  reducer,
  isTerminal,
  component: PylosPyramidGame,
};
