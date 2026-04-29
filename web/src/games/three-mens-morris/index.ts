import type { GamePlugin } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { GameState, GameAction, GameSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { ThreeMensMorrisGame } from "./Game.js";
const settings = { dummy: { kind: "boolean" as const, label: "dummy", default: false } } as const;
type S = SettingsOf<typeof settings>;
export const threeMensMorrisPlugin: GamePlugin<GameState, GameAction, typeof settings> = {
  id: "three-mens-morris",
  title: "Three Men's Morris",
  category: "board",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Tic-Tac-Toe-like Morris on a 3x3 grid. Form 3-in-a-row vs random CPU.",
  howToPlay: "Three Men's Morris is the smallest and oldest Morris variant — essentially a placement-only Tic-Tac-Toe with a unique twist. Players alternate placing 3 pieces each, then move them to adjacent cells trying to form a mill (3-in-a-row). In this simplified placement-only version, the game ends when both sides have placed all pieces or one side completes a line.\n\nClick any empty cell on the 3x3 grid to place a P piece. If your placement forms 3-in-a-row in any direction (horizontal, vertical, or diagonal), you win immediately! After your turn, a random CPU places a C piece on an empty cell.\n\nGameplay continues for up to 8 moves or until one side completes a line. You earn 100 points for forming 3-in-a-row first, 25 for a board-full draw, 0 for the CPU winning, plus 5 bonus points per surviving P piece. Despite its simplicity, Three Men's Morris dates to the Roman Empire and remains a charming pocket game. Use central placement aggressively — center participates in 4 lines while corners only have 3.",
  settings,
  initialState: (seed: number, s: S) => initialState(seed, s as GameSettings),
  reducer,
  isTerminal,
  component: ThreeMensMorrisGame,
};
