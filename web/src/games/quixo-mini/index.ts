import type { GamePlugin, SettingsOf } from "../../platform/game-plugin/types.js";
import type { ConnectState, ConnectAction, ConnectSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { ConnectGame } from "./Game.js";

const settings = { dummy: { kind: "boolean" as const, label: "dummy", default: false } } as const;
type S = SettingsOf<typeof settings>;

export const quixoMiniPlugin: GamePlugin<ConnectState, ConnectAction, typeof settings> = {
  id: "quixo-mini",
  title: "Quixo (Mini)",
  category: "board",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Push rows of cubes to make five in a row of your symbol.",
  howToPlay: "Quixo is a 5×5 row-pushing game where players take turns selecting a cube on the edge of the grid, flipping it to their symbol, and sliding the entire row or column. The first to align five of their symbol in a row, column, or diagonal wins. This Mini edition simplifies the row-pushing into placement on an empty board.\n\nYou play first against a random CPU on a 5×5 grid. Click any empty cell to place your mark. The CPU plays a random legal move. The first to align five marks in a row wins. Because the board is 5×5 and the win condition is five, every win runs across an entire row, column, or diagonal — making play tense throughout.\n\nThe board displays as a 5×5 grid. Your marks show red; the CPU's show blue. Filled cells are not selectable.\n\nQuixo Mini play centers on covering both diagonals early since five-in-a-row through them is forced. The CPU plays random legal moves, so methodical placement reliably wins. Score: 100 plus a piece bonus for a win; 25 for a draw.",
  settings,
  initialState: (seed: number, s: S) => initialState(seed, s as ConnectSettings),
  reducer,
  isTerminal,
  component: ConnectGame,
};
