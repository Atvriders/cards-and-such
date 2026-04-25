import type { GamePlugin } from "../../platform/game-plugin/types.js";
import type { Connect6State, Connect6Action, Connect6Settings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { Connect6 } from "./Game.js";

const settings = {} as const;

export const connect6Plugin: GamePlugin<Connect6State, Connect6Action, typeof settings> = {
  id: "connect6",
  title: "Connect 6",
  category: "board",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Place 6 in a row on a 19×19 board. Black plays 1 stone first, then each player plays 2.",
  howToPlay: `Connect6 was invented by Professor I-Chen Wu in 2003. It is played on a 19×19 Go board. The goal is to be the first player to place six stones in an unbroken row — horizontally, vertically, or diagonally.

You play as Black. On the very first move, Black places exactly one stone anywhere on the board. Afterwards, both players alternate placing two stones per turn. This two-stones-per-turn rule is what makes the game dramatically more combinatorial than Connect 5 or Gomoku.

Click any empty intersection to place a stone. When it is your turn and you still have a stone remaining, the status bar will show how many stones you have left to place before the bot responds.

The bot evaluates positions greedily, prioritising cells that extend its own lines and block your lines. It looks for clusters of five and four in sequence.

Strategy tips: control the centre early, spread threats across multiple directions so the bot cannot block all simultaneously, and always count your sixes before committing to a direction. Defensive play is equally important — a single uncontested four can grow into a winning six quickly.`,
  settings,
  initialState: (seed: number, s: Connect6Settings) => initialState(seed, s),
  reducer,
  isTerminal,
  component: Connect6,
};
