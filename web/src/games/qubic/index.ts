import type { GamePlugin, SettingsOf } from "../../platform/game-plugin/types.js";
import type { ConnectState, ConnectAction, ConnectSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { ConnectGame } from "./Game.js";

const settings = { dummy: { kind: "boolean" as const, label: "dummy", default: false } } as const;
type S = SettingsOf<typeof settings>;

export const qubicPlugin: GamePlugin<ConnectState, ConnectAction, typeof settings> = {
  id: "qubic",
  title: "Qubic",
  category: "board",
  players: { min: 1, max: 1, multiplayer: false },
  description: "4x4x4 3D tic-tac-toe represented on a 4x4 grid; four in a row wins.",
  howToPlay: "Qubic is a connect-line strategy game played on a 4x4 grid. Inspired by the 3D classic. Build a line of four on the 4x4 plane.\n\nYou play first against a random CPU opponent. Click any empty square to place your piece (you are red; CPU is blue). The first player to align 4 of their pieces in a row, column, or diagonal wins the game.\n\nThe CPU picks valid moves at random, so a little planning beats it consistently. Watch for double-threat positions where two lines could complete on your next move; the CPU usually only blocks the most recent threat. The center of the board controls the most lines, so claiming it early is a strong play.\n\nScoring rewards a win heavily: a victory grants 100 points plus a small bonus for every piece placed. A draw (board full with no line of 4) is worth 25 points. A loss scores zero. The match ends as soon as a line of 4 forms or the board fills up entirely. Play one match per round.",
  settings,
  initialState: (seed: number, s: S) => initialState(seed, s as ConnectSettings),
  reducer,
  isTerminal,
  component: ConnectGame,
};
