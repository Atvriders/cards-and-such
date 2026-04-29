import type { GamePlugin, SettingsOf } from "../../platform/game-plugin/types.js";
import type { ConnectState, ConnectAction, ConnectSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { ConnectGame } from "./Game.js";

const settings = { dummy: { kind: "boolean" as const, label: "dummy", default: false } } as const;
type S = SettingsOf<typeof settings>;

export const gomokuClassicPlugin: GamePlugin<ConnectState, ConnectAction, typeof settings> = {
  id: "gomoku-classic",
  title: "Gomoku (Classic)",
  category: "board",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Classic five-in-a-row on a 15×15 grid against a CPU.",
  howToPlay: "Gomoku Classic is the standard five-in-a-row connect game played on a 15×15 grid. Two players take turns placing stones on empty intersections; the first to align five stones horizontally, vertically, or diagonally wins.\n\nYou play black against a random CPU playing white. Click any empty cell to place your stone. The CPU then plays a random legal move and play alternates. The board fills row by row until someone makes five in a row or every intersection is occupied (draw).\n\nThe board displays as a 15×15 grid. Your stones show red; the CPU's stones show blue. Filled cells are not selectable.\n\nClassic Gomoku strategy revolves around building open-three and open-four threats. An open four cannot be blocked from both ends in one move and forces a five next turn. Watch for the CPU's threats and block them. Because the CPU plays random moves, you can build surprisingly elaborate winning sequences. A win scores 100 points plus a piece bonus; a draw scores 25; loss scores zero. Try to win on the smallest piece count for the best score.",
  settings,
  initialState: (seed: number, s: S) => initialState(seed, s as ConnectSettings),
  reducer,
  isTerminal,
  component: ConnectGame,
};
