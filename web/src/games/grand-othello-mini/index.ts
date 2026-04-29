import type { GamePlugin } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { GameState, GameAction, GameSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { GrandOthelloMiniGame } from "./Game.js";
const settings = { dummy: { kind: "boolean" as const, label: "dummy", default: false } } as const;
type S = SettingsOf<typeof settings>;
export const grandOthelloMiniPlugin: GamePlugin<GameState, GameAction, typeof settings> = {
  id: "grand-othello-mini",
  title: "Grand Othello (Mini)",
  category: "board",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Larger Othello variant on 7x7 — flank and flip discs. Place vs random CPU.",
  howToPlay: "Grand Othello is a larger version of the classic Reversi/Othello game, traditionally played on a 10x10 board (this implementation uses a 7x7 compact grid). The core flank-and-flip mechanic remains: when you place a disc, any opposing discs in a continuous straight line (horizontal, vertical, or diagonal) bookended by your discs are flipped to your color.\n\nClick any empty cell to place a P piece. After placement, every C piece in a line that ends in another P (with no gaps) is flipped to P. After your turn, a random CPU places a C piece that may symmetrically flip P pieces to C using the same flank rule.\n\nGameplay lasts up to 22 moves or until the board fills. You earn 100 points for ending with more P than C pieces, 25 for a tie, plus 3 points per P disc on the board. The larger 7x7 board makes flips more strategic — corner cells are powerful because they cannot be flipped, and edge cells are nearly-safe because they only flip from one direction. Aim for stable territory.",
  settings,
  initialState: (seed: number, s: S) => initialState(seed, s as GameSettings),
  reducer,
  isTerminal,
  component: GrandOthelloMiniGame,
};
