import type { GamePlugin, SettingsOf } from "../../platform/game-plugin/types.js";
import type { ConnectState, ConnectAction, ConnectSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { GomokuClassicGame } from "./Game.js";

const settings = {
  botStrength: { kind: "enum" as const, label: "Bot", options: ["easy", "hard"] as const, default: "easy" as const },
} as const;

type S = SettingsOf<typeof settings>;

export const gomokuClassicPlugin: GamePlugin<ConnectState, ConnectAction, typeof settings> = {
  id: "gomoku-classic",
  title: "Gomoku (Classic)",
  category: "board",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Classic five-in-a-row on a 15×15 grid against a CPU.",
  howToPlay: `Gomoku Classic is the standard five-in-a-row game played on a 15×15 grid. Two players take turns placing stones on empty cells; the first to align five stones horizontally, vertically, or diagonally wins.

You play Black; the CPU plays White. Click any empty cell to place your stone. The bot replies with a heuristic that scores both attack (its own threats) and defence (your threats), placing where the position is hottest.

The winning line is highlighted on victory. Easy bot is greedy; Hard places extra weight on blocking your threats and is significantly stronger.

Scoring: win = 100, draw = 50, loss = 0.

Tips: build open threes and open fours — an open four cannot be blocked at both ends in a single move and forces a win on the next turn. Always check whether the CPU has a winning threat before pursuing your own.`,
  settings,
  initialState: (seed: number, s: S) => initialState(seed, s as ConnectSettings),
  reducer,
  isTerminal,
  component: GomokuClassicGame,
};
