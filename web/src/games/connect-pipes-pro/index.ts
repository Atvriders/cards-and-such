import type { GamePlugin } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { ConnectPipesState, ConnectPipesAction } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { ConnectPipesPro } from "./Game.js";

export const connectPipesProSettings = {
  size: {
    kind: "enum" as const,
    label: "Grid Size",
    options: ["5", "6", "7"] as const,
    default: "5" as const,
  },
} as const;

type ConnectPipesProSettingsType = SettingsOf<typeof connectPipesProSettings>;

export const connectPipesProPlugin: GamePlugin<ConnectPipesState, ConnectPipesAction, typeof connectPipesProSettings> = {
  id: "connect-pipes-pro",
  title: "Connect Pipes Pro",
  category: "board",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Draw pipes to connect matching colored dots and fill the entire grid.",
  howToPlay: `Connect matching colored dot pairs by drawing continuous pipe paths. Every cell on the grid must be filled for the puzzle to be complete.

Click and drag from any colored endpoint to draw a pipe. The pipe must travel orthogonally — no diagonal moves allowed. When you reach the matching endpoint of the same color, the connection is complete. You must connect ALL pairs AND fill every grid cell to win.

If a path blocks you, drag back over your own pipe to erase it and try a different route. Each pipe automatically clears when you start a new path from one of its endpoints.

Score is based on how few drag operations (moves) you needed. A perfect solve uses minimal moves. The 5×5 grid has 4 color pairs, 6×6 has 5 pairs, and 7×7 has 6 pairs.

Strategy tips: Start by connecting pairs whose endpoints are nearest together. Leave longer, more flexible paths for later so they can wind through remaining empty space. Check corners and edges first — paths there have fewer options. Work inward from the board edges to avoid trapping yourself in unreachable cells.`,
  settings: connectPipesProSettings,
  initialState: (seed: number, settings: ConnectPipesProSettingsType) => initialState(seed, settings),
  reducer,
  isTerminal,
  component: ConnectPipesPro,
};
