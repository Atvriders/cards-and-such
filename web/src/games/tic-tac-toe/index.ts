import type { GamePlugin } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { TTTState, TTTAction } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { TicTacToe } from "./TicTacToe.js";

export const ticTacToeSettings = {
  boardSize: {
    kind: "enum" as const,
    label: "Board Size",
    options: ["3", "4", "5"] as const,
    default: "3",
  },
  winLength: {
    kind: "enum" as const,
    label: "Win Length",
    options: ["3", "4", "5"] as const,
    default: "3",
  },
  opponent: {
    kind: "enum" as const,
    label: "Opponent",
    options: ["bot", "hot-seat"] as const,
    default: "bot",
  },
  botStrength: {
    kind: "enum" as const,
    label: "Bot Strength",
    options: ["easy", "hard"] as const,
    default: "hard",
  },
} as const;

type TTTSettingsType = SettingsOf<typeof ticTacToeSettings>;

export const ticTacToePlugin: GamePlugin<TTTState, TTTAction, typeof ticTacToeSettings> = {
  id: "tic-tac-toe",
  title: "Tic-Tac-Toe",
  category: "board",
  players: { min: 1, max: 2, multiplayer: false },
  description: "Classic 3-in-a-row — or 4, or 5.",
  settings: ticTacToeSettings,
  initialState: (seed: number, settings: TTTSettingsType) => initialState(seed, settings),
  reducer,
  isTerminal,
  component: TicTacToe,
};
