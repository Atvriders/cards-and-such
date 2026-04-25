import type { GamePlugin } from "../../platform/game-plugin/types.js";
import type { PicariaState, PicariaAction, PicariaSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { Picaria } from "./Game.js";

const settings = {} as const;

export const picariaPlugin: GamePlugin<PicariaState, PicariaAction, typeof settings> = {
  id: "picaria",
  title: "Picaria",
  category: "board",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Pueblo tic-tac-toe variant — place 3 pieces then slide along lines to get 3 in a row.",
  howToPlay: `Picaria is a traditional game of the Zuni and other Pueblo peoples of the American Southwest, played on a 3×3 grid with diagonal connections through the center. Each player has exactly 3 pieces.

The game has two phases. In the Placement phase, players alternate placing one piece at a time on any empty intersection. Once all six pieces are placed, the Movement phase begins. On your turn, slide one of your pieces along any connected line to an adjacent empty intersection.

The objective is simple: get all three of your pieces in a straight row (horizontal, vertical, or diagonal). The first player to achieve this wins. Because pieces can be moved freely once placed, games can continue for many turns — it is crucial to block your opponent while building your own threats.

The center point is the most powerful square — it connects to every other point on the board. The bot searches at depth 5 using minimax, so it plays a strong game. To win, you must use forks (threats in two directions simultaneously) to force the bot into an impossible defense.`,
  settings,
  initialState: (seed: number, s: PicariaSettings) => initialState(seed, s),
  reducer,
  isTerminal,
  component: Picaria,
};
