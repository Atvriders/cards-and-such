import type { GamePlugin, SettingsOf } from "../../platform/game-plugin/types.js";
import type { ConnectSixState, ConnectSixAction, ConnectSixSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { ConnectSixGame } from "./Game.js";

const settings = {
  botStrength: { kind: "enum" as const, label: "Bot", options: ["easy", "hard"] as const, default: "easy" as const },
} as const;

type S = SettingsOf<typeof settings>;

export const connectSixPlugin: GamePlugin<ConnectSixState, ConnectSixAction, typeof settings> = {
  id: "connect-six",
  title: "Connect Six",
  category: "board",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Connect-Four-style gravity drop on a wide 11×9 board. Six in a row wins.",
  howToPlay: `Connect Six plays just like Connect Four, but you need six aligned discs in a straight line and the board is much wider (11 columns × 9 rows) to give you the room.

Click a column to drop your disc (pink) into it. Discs fall to the lowest empty row in that column under gravity. The bot plays blue and replies immediately. The first player to align six discs horizontally, vertically, or diagonally wins. If every column fills with no six-line, the game is a draw.

Easy bot prefers the centre, blocks immediate wins, and plays safe; Hard bot uses a window-scoring heuristic to value threats and walls.

Scoring: win = 100, draw = 50, loss = 0.

Tips: longer threats need more support — you may need to build up multiple stones across columns to set up a six-line. Watch for double-threats: two unblockable threats in a single move force a win.`,
  settings,
  initialState: (seed: number, s: S) => initialState(seed, s as ConnectSixSettings),
  reducer,
  isTerminal,
  component: ConnectSixGame,
};
