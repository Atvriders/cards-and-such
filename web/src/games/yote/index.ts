import type { GamePlugin } from "../../platform/game-plugin/types.js";
import type { YoteState, YoteAction } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { YoteGame } from "./Game.js";

const settings = {} as const;

export const yotePlugin: GamePlugin<YoteState, YoteAction, typeof settings> = {
  id: "yote",
  title: "Yoté",
  category: "board",
  players: { min: 1, max: 1, multiplayer: false },
  description: "West African capture game — place stones then jump to win.",
  howToPlay: `Yoté is a traditional West African strategy game played on a 5×6 grid. Each player begins with 12 stones held in reserve. You play dark stones; the bot plays light stones.

The game has two overlapping phases:

Placement: When it is your turn and you still have stones in reserve, you may place one stone onto any empty square on the board. You do not need to place all your stones before moving — placement and movement happen on the same turns.

Movement: You may instead move one of your stones already on the board one step orthogonally (left, right, up, down — not diagonal) to an adjacent empty square.

Capture: If one of your stones is adjacent to an opponent's stone, and the square directly beyond it is empty, you must jump over it to capture it (mandatory if available). In the traditional game a bonus capture is allowed; in this version the standard jump capture applies.

Captures are mandatory — if any capture is available on your turn, you must take one.

Win by capturing all of the opponent's stones (both those on the board and those still in reserve count toward their total).

Bot strategy: minimax at depth 2, preferring captures and maximizing stone-count advantage.`,
  settings,
  initialState: (seed: number) => initialState(seed),
  reducer,
  isTerminal,
  component: YoteGame,
};
