import type { GamePlugin } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { GameState, GameAction, GameSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { SternhalmaGameGame } from "./Game.js";
const settings = { dummy: { kind: "boolean" as const, label: "dummy", default: false } } as const;
type S = SettingsOf<typeof settings>;
export const sternhalmaGamePlugin: GamePlugin<GameState, GameAction, typeof settings> = {
  id: "sternhalma-game",
  title: "Sternhalma (Star Halma)",
  category: "board",
  players: { min: 1, max: 1, multiplayer: false },
  description: "German Chinese Checkers — race pegs across a star board. Place vs random CPU.",
  howToPlay: "Sternhalma is the original 1892 German game also known as Chinese Checkers — a race game played on a six-pointed star-shaped board where players move pegs from their home triangle to the opposite point of the star. In this compact 7x7 grid adaptation, the star geometry is simplified into a square race-and-place mini-game.\n\nClick any empty cell on the board to place a P piece. Cells in the upper rows count as the CPU's home and cells in the lower rows are your home — placing in the opposite half scores progress. The CPU then places a C piece on a random empty cell. Continue alternating for up to 24 total moves or until the board fills.\n\nYou earn 100 points if more of your pieces sit in the upper-half goal rows than CPU pieces in the lower-half goal rows, 25 for a tie, 0 otherwise. Plus 3 points per P piece in the upper half. Strategy: focus placements on the far rows to maximize goal-region count, while occasional midfield placements can block the CPU random reach.",
  settings,
  initialState: (seed: number, s: S) => initialState(seed, s as GameSettings),
  reducer,
  isTerminal,
  component: SternhalmaGameGame,
};
