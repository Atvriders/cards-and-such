import type { GamePlugin } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { GameState, GameAction, GameSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { LosingCheckersGame } from "./Game.js";
const settings = { dummy: { kind: "boolean" as const, label: "dummy", default: false } } as const;
type S = SettingsOf<typeof settings>;
export const losingCheckersPlugin: GamePlugin<GameState, GameAction, typeof settings> = {
  id: "losing-checkers",
  title: "Losing Checkers",
  category: "board",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Misere Checkers — first to lose all pieces wins. Place vs random CPU.",
  howToPlay: "Losing Checkers is the misere variant of Checkers — also known as Anti-Checkers or Suicide Checkers — where the goal is INVERTED: the first player to lose all of their pieces (or be unable to move) WINS. This devious objective transforms classical defensive play into eager sacrifice.\n\nIn this compact placement adaptation on an 8x8 board, you start with five P pieces in the bottom-left corner, the CPU starts with five C pieces in the top-right. Click any empty cell to place a P piece. If your placement creates a diagonal sandwich, the captured P piece is REMOVED (counting toward your sacrifice goal). After you move, a random CPU places a C piece similarly.\n\nGameplay lasts up to 22 moves or until one side has zero pieces on the board. You earn 100 points if all your P pieces are captured first (paradoxical victory!), 50 if you end with fewer pieces than the CPU, 25 for a tie, plus 5 points per move played. Aggressive sacrificial placement is rewarded. Look for forced-capture spots.",
  settings,
  initialState: (seed: number, s: S) => initialState(seed, s as GameSettings),
  reducer,
  isTerminal,
  component: LosingCheckersGame,
};
