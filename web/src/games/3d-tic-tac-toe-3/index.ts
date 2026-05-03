import type { GamePlugin, SettingsOf } from "../../platform/game-plugin/types.js";
import type { ConnectState, ConnectAction, ConnectSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { ConnectGame } from "./Game.js";

const settings = { dummy: { kind: "boolean" as const, label: "dummy", default: false } } as const;
type S = SettingsOf<typeof settings>;

export const threeDTicTacToePlugin: GamePlugin<ConnectState, ConnectAction, typeof settings> = {
  id: "3d-tic-tac-toe-3",
  title: "3D Tic-Tac-Toe",
  category: "board",
  players: { min: 1, max: 1, multiplayer: false },
  description: "3D-themed tic-tac-toe: four in a row across an expanded 5x5 grid.",
  howToPlay: "3D Tic-Tac-Toe is a connect-line strategy game played on a 5x5 grid. An expanded 5x5 grid representing 3D play. Four in a row wins.\n\nYou play first against a random CPU opponent. Click any empty square to place your piece (you are red; CPU is blue). The first player to align 4 of their pieces in a row, column, or diagonal wins the game.\n\nThe CPU picks valid moves at random, so a little planning beats it consistently. Watch for double-threat positions where two lines could complete on your next move; the CPU usually only blocks the most recent threat. The center of the board controls the most lines, so claiming it early is a strong play.\n\nScoring rewards a win heavily: a victory grants 100 points plus a small bonus for every piece placed. A draw (board full with no line of 4) is worth 25 points. A loss scores zero. The match ends as soon as a line of 4 forms or the board fills up entirely. Play one match per round.",
  settings,
  initialState: (seed: number, s: S) => initialState(seed, s as ConnectSettings),
  reducer,
  isTerminal,
  hint: (state) => state.phase === "playing" && state.turn === "P" ? { selector: ".cn-cell:not(.p):not(.c)", pulses: 3 } : null,
  component: ConnectGame,
};
