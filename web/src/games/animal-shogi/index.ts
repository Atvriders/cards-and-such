import type { GamePlugin } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { GameState, GameAction, GameSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { AnimalShogiGame } from "./Game.js";
const settings = { dummy: { kind: "boolean" as const, label: "dummy", default: false } } as const;
type S = SettingsOf<typeof settings>;
export const animalShogiPlugin: GamePlugin<GameState, GameAction, typeof settings> = {
  id: "animal-shogi",
  title: "Animal Shogi (Dobutsu)",
  category: "board",
  players: { min: 1, max: 1, multiplayer: false },
  description: "3x4 beginner Shogi for kids — capture the CPU lion. Place vs random CPU.",
  howToPlay: "Animal Shogi (Dobutsu Shogi) is a 3x4 beginner Shogi variant designed in 2008 by Madoka Kitao to teach Japanese chess principles to children. The pieces are charming animals: Lion (king), Giraffe, Elephant, and Chick. In this placement-style adaptation, the tiny board makes for lightning-fast tactical games.\n\nClick any empty cell to place a P (your animal) piece. If your placement is orthogonally OR diagonally adjacent to a C piece, that C piece is captured and removed (modeling the Lion's 8-direction reach). After your turn, a random CPU places a C piece, capturing any P pieces it touches in the same way.\n\nGameplay lasts up to 10 moves or until the board fills. You earn 100 points for ending with more P pieces than C pieces, 25 for a tie, 0 otherwise, plus 6 points per surviving P piece. The very small board gives every placement enormous impact — a center cell touches 8 neighbors; a corner only 3. Place defensively along edges to minimize counter-capture risk while building a piece advantage.",
  settings,
  initialState: (seed: number, s: S) => initialState(seed, s as GameSettings),
  reducer,
  isTerminal,
  component: AnimalShogiGame,
};
