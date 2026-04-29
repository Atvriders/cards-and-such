import type { GamePlugin } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { GameState, GameAction, GameSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { ToguzKorgoolGame } from "./Game.js";
const settings = { dummy: { kind: "boolean" as const, label: "dummy", default: false } } as const;
type S = SettingsOf<typeof settings>;
export const toguzKorgoolPlugin: GamePlugin<GameState, GameAction, typeof settings> = {
  id: "toguz-korgool",
  title: "Toguz Korgool",
  category: "board",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Kyrgyz Mancala — sow pebbles around pits, capture full ones. Place vs random CPU.",
  howToPlay: "Toguz Korgool is the national board game of Kyrgyzstan and Kazakhstan — a Mancala-family game played on two rows of 9 pits with each pit starting with 9 stones. In this compact placement adaptation on a 5x5 grid, the sow-and-capture mancala spirit is preserved through tactical placement.\n\nClick any empty cell to place a P piece. If your placement is on a cell where the row-index plus column-index equals an even number (a korgool capture cell), every diagonally-adjacent C piece is captured and removed. After your turn, a random CPU places a C piece on an empty cell that may symmetrically capture diagonal P neighbors.\n\nGameplay lasts up to 18 moves or until the board fills. You earn 100 points for ending with more P pieces than C pieces, 25 for a tie, plus 3 points per P piece on the board. The capture geometry rewards specific cell parities — half the cells are capture cells and half are safe. Memorize which cells trigger captures and place your first move on a high-impact capture cell.",
  settings,
  initialState: (seed: number, s: S) => initialState(seed, s as GameSettings),
  reducer,
  isTerminal,
  component: ToguzKorgoolGame,
};
