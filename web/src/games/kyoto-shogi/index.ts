import type { GamePlugin } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { GameState, GameAction, GameSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { KyotoShogiGame } from "./Game.js";
const settings = { dummy: { kind: "boolean" as const, label: "dummy", default: false } } as const;
type S = SettingsOf<typeof settings>;
export const kyotoShogiPlugin: GamePlugin<GameState, GameAction, typeof settings> = {
  id: "kyoto-shogi",
  title: "Kyoto Shogi",
  category: "board",
  players: { min: 1, max: 1, multiplayer: false },
  description: "5x5 Shogi variant where every piece flips after moving. Place vs random CPU.",
  howToPlay: "Kyoto Shogi is a unique 5x5 Shogi variant designed by Tamiya Katsuya where every piece flips its identity each time it moves. Promotion is mandatory and constant, leading to a fast-paced strategic flow. In this compact placement adaptation, the flip mechanic is preserved through alternating piece states.\n\nClick any empty cell to place a P piece. Each placement increments a flip-counter; when the counter is even, your placement also captures any orthogonally-adjacent C piece, when odd, it captures any diagonally-adjacent C piece. After your turn, a random CPU places a C piece that captures P pieces using the opposite geometry of the current flip-state.\n\nGameplay continues for up to 16 moves or until the board fills. You earn 100 points for ending with more P pieces than C pieces, 25 for a tie, plus 4 points per surviving P piece. The constant flip between orthogonal and diagonal capture geometry rewards adaptive thinking — a placement that's safe one turn becomes vulnerable the next. Track the move counter carefully and exploit predictable flip parity to capture maximum CPU pieces.",
  settings,
  initialState: (seed: number, s: S) => initialState(seed, s as GameSettings),
  reducer,
  isTerminal,
  component: KyotoShogiGame,
};
