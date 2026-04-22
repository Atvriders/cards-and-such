import type { GamePlugin } from "../../platform/game-plugin/types.js";
import type { HnefataflState, HnefataflAction, HnefataflSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { Hnefatafl } from "./Game.js";

const settings = {} as const;

export const hnefataflPlugin: GamePlugin<HnefataflState, HnefataflAction, typeof settings> = {
  id: "hnefatafl",
  title: "Hnefatafl",
  category: "board",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Asymmetric Viking strategy — defenders escort the King to a corner.",
  howToPlay: `Hnefatafl (pronounced "nef-ah-tah-fel") is an ancient Norse strategy game of asymmetric warfare on an 11×11 board. You play as the Defenders: your goal is to escort the King (♔) to any corner square to win. The bot controls the Attackers, who must capture the King to win.

Pieces move like chess rooks — any number of squares in a straight line, but they cannot jump over other pieces. Corners and the central throne square may only be entered by the King.

Capture happens by sandwiching an opponent's piece between two of yours orthogonally (horizontally or vertically). The King is captured only if all four orthogonal sides are blocked by attackers. Corners and the throne act as hostile squares that count as an attacker for sandwiching ordinary defenders.

To move, click one of your Defenders or the King to select it (highlighted in yellow), then click a valid destination square. The bot responds automatically as the Attackers.

Tactics: open a path for the King while blocking attacker advances. The King can help pin attackers. The bot searches two moves ahead with minimax.`,
  settings,
  initialState: (seed: number, s: HnefataflSettings) => initialState(seed, s),
  reducer,
  isTerminal,
  component: Hnefatafl,
};
