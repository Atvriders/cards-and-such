import type { GamePlugin } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { GameState, GameAction, GameSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { SixMensMorrisGame } from "./Game.js";
const settings = { dummy: { kind: "boolean" as const, label: "dummy", default: false } } as const;
type S = SettingsOf<typeof settings>;
export const sixMensMorrisPlugin: GamePlugin<GameState, GameAction, typeof settings> = {
  id: "six-mens-morris",
  title: "Six Men's Morris",
  category: "board",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Smaller Morris variant — form mills to remove CPU pieces. Place vs random CPU.",
  howToPlay: "Six Men's Morris is the simpler Morris variant, played historically on a board of 16 intersections with each player using 6 pieces. The mill mechanic (form 3-in-a-row, remove an opposing piece) drives the strategic core. In this compact 4x4 grid adaptation, mill lines are restricted to rows and columns only (no diagonals).\n\nClick any empty cell to place a P piece. If your placement completes any 3-in-a-row in a row OR column, one C piece is randomly removed from the board. After your turn, a random CPU drops a C piece that may symmetrically form a mill and remove a P piece.\n\nGameplay continues for up to 14 moves or until the board fills. You earn 100 points for ending with more P pieces than C pieces, 25 for a tie, plus 5 points per surviving P piece. The smaller board means almost every placement matters tactically. Look for cells that participate in multiple potential mill lines (corners are weakest, mid-edge cells are strongest because they belong to two mill axes simultaneously).",
  settings,
  initialState: (seed: number, s: S) => initialState(seed, s as GameSettings),
  reducer,
  isTerminal,
  component: SixMensMorrisGame,
};
