import type { GamePlugin, SettingsOf } from "../../platform/game-plugin/types.js";
import type { ConnectFiveState, ConnectFiveAction, ConnectFiveSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { ConnectFiveGame } from "./Game.js";

const settings = {
  botStrength: { kind: "enum" as const, label: "Bot", options: ["easy", "hard"] as const, default: "easy" as const },
} as const;

type S = SettingsOf<typeof settings>;

export const connectFivePlugin: GamePlugin<ConnectFiveState, ConnectFiveAction, typeof settings> = {
  id: "connect-five",
  title: "Connect Five",
  category: "board",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Connect-Four-style gravity drop on a 9-wide × 8-tall grid. Five in a row wins.",
  howToPlay: `Connect Five plays just like Connect Four, but you need five aligned discs to win, and the board is wider (9 columns × 8 rows) to give you the room.

Click a column to drop your disc (red) into it. Discs fall to the lowest empty row in that column under gravity. The bot plays yellow and replies immediately. The first player to align five discs horizontally, vertically, or diagonally wins. If every column fills with no five-line, the game is a draw.

Easy bot prefers the centre, blocks immediate wins, and plays safe; Hard bot uses a window-scoring heuristic to value threats and walls.

Scoring: win = 100, draw = 50, loss = 0.

Tip: control the centre columns — they're part of more winning lines than the edges, and force the opponent into reactive play.`,
  settings,
  initialState: (seed: number, s: S) => initialState(seed, s as ConnectFiveSettings),
  reducer,
  isTerminal,
  hint: (s: any) => { const p = (s as any).phase; if (p === "gameover" || p === "done" || p === "ended" || (s as any).gameOver) return null; return { selector: '[data-testid="hint-target-connect-five-action"]', pulses: 3 }; },
  component: ConnectFiveGame,
};
