import type { GamePlugin } from "../../platform/game-plugin/types.js";
import type { SenetState, SenetAction, SenetSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { Senet } from "./Game.js";

const settings = {} as const;

export const senetPlugin: GamePlugin<SenetState, SenetAction, typeof settings> = {
  id: "senet",
  title: "Senet",
  category: "board",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Ancient Egyptian race game — throw sticks and race your pieces off the board before the bot.",
  howToPlay: `Senet is one of the oldest board games, played in Ancient Egypt over 5,000 years ago. The board has 30 squares arranged in a three-row snake. You have 5 gold pieces; the bot has 5 dark pieces. Race all five of yours off the board to win.

Each turn, click Roll Sticks. Four sticks fall — each shows light or dark. Count the light sides; all dark = 5. The result is how many squares you move. After rolling, click one of your highlighted pieces to move it. Pieces move along the snake path: left on row 1, right on row 2, then left on row 3.

If you land on an opponent's piece, you swap places — unless the opponent has two or more consecutive pieces (they are protected). Landing on square 27 (🌊 House of Water) sends your piece back to square 15 (House of Rebirth). If square 15 is occupied, the piece goes to the nearest free square before it.

Rolling 1, 4, or 5 grants an extra turn. To escape off the board from square 30, you must roll exactly the right amount. The bot uses a greedy strategy — preferring captures and furthest-advanced pieces.

Win by escaping all 5 of your pieces.`,
  settings,
  initialState: (seed: number, s: SenetSettings) => initialState(seed, s),
  reducer,
  isTerminal,
  component: Senet,
};
