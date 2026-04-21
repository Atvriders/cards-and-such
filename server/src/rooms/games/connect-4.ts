import { registerServerGame } from "../game-registry.js";
import {
  connect4Initial,
  connect4Reduce,
  connect4Terminal,
  type Connect4State,
  type Connect4Action,
} from "@cards/shared";

export function registerConnect4(): void {
  registerServerGame<Connect4State, Connect4Action>({
    gameId: "connect-4",
    minPlayers: 2,
    maxPlayers: 2,
    initialState: connect4Initial,
    reducer: (s, a, seat) => connect4Reduce(s, a, seat),
    isTerminal: connect4Terminal,
  });
}
