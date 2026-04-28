import type { GamePlugin, SettingsOf } from "../../platform/game-plugin/types.js";
import type { ConnectState, ConnectAction, ConnectSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { ConnectGame } from "./Game.js";

const settings = { dummy: { kind: "boolean" as const, label: "dummy", default: false } } as const;
type S = SettingsOf<typeof settings>;

export const connectSixPlugin: GamePlugin<ConnectState, ConnectAction, typeof settings> = {
  id: "connect-six",
  title: "Connect Six",
  category: "board",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Six-in-a-row variant with two pieces per turn after the first.",
  howToPlay: "Connect Six is a connect-line strategy game played on a 9x9 grid. Six in a row wins. Place pieces freely on a 9x9 board against a random CPU.\n\nYou play first against a random CPU opponent. Click any empty square to place your piece (you are red; CPU is blue). The first player to align 6 of their pieces in a row, column, or diagonal wins the game.\n\nThe CPU picks valid moves at random, so a little planning beats it consistently. Watch for double-threat positions where two lines could complete on your next move; the CPU usually only blocks the most recent threat. The center of the board controls the most lines, so claiming it early is a strong play.\n\nScoring rewards a win heavily: a victory grants 100 points plus a small bonus for every piece placed. A draw (board full with no line of 6) is worth 25 points. A loss scores zero. The match ends as soon as a line of 6 forms or the board fills up entirely. Play one match per round.",
  settings,
  initialState: (seed: number, s: S) => initialState(seed, s as ConnectSettings),
  reducer,
  isTerminal,
  component: ConnectGame,
};
