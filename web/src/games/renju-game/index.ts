import type { GamePlugin, HintTarget } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { GameState, GameAction, GameSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { RenjuGameGame } from "./Game.js";
const settings = { dummy: { kind: "boolean" as const, label: "dummy", default: false } } as const;
type S = SettingsOf<typeof settings>;
export const renjuGamePlugin: GamePlugin<GameState, GameAction, typeof settings> = {
  id: "renju-game",
  title: "Renju",
  category: "board",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Gomoku with restrictions on first player. Form 5-in-a-row vs random CPU.",
  howToPlay: "Renju is the professional Japanese form of Gomoku, played on a 7x7 grid in this implementation. Renju adds restrictions to the first player (Black, you) to balance Gomoku's well-known first-mover advantage. The first to align exactly five stones in a row wins, but as Black you cannot make six-in-a-row (overlines) or other forbidden patterns.\n\nClick any empty cell to place your stone. The CPU responds with a random legal placement. If you accidentally create a forbidden pattern, you lose immediately, adding tactical depth absent from plain Gomoku.\n\nYou earn 100 points for forming exactly five-in-a-row, 25 for the board filling without resolution, and 0 for a forbidden-move loss or CPU five-in-a-row. In this compact 7x7 variant, the restrictions are checked simply: any time placing creates an overline (six or more), you lose. The CPU is unrestricted, allowing you to focus on positional play. Mid-board placement tends to be strongest.",
  settings,
  initialState: (seed: number, s: S) => initialState(seed, s as GameSettings),
  reducer,
  isTerminal,
  hint: (): HintTarget | null => (typeof document !== "undefined" && document.querySelector(".rnj-board")) ? { selector: ".rnj-board", pulses: 3 } : null,
  component: RenjuGameGame,
};
