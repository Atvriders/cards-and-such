import { registerServerGame } from "../game-registry.js";
import {
  unoInitial, unoReduce, unoTerminal,
  type UnoLikeState, type UnoLikeAction,
} from "@cards/shared";

export function registerUnoLike(): void {
  registerServerGame<UnoLikeState, UnoLikeAction>({
    gameId: "uno-like",
    minPlayers: 2,
    maxPlayers: 4,
    initialState: unoInitial,
    reducer: (s, a, seat) => unoReduce(s, a, seat),
    isTerminal: unoTerminal,
  });
}
