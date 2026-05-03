import type { GamePlugin, SettingsOf , HintTarget} from "../../platform/game-plugin/types.js";
import type { ConnectState, ConnectAction, ConnectSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { ConnectGame } from "./Game.js";

const settings = { dummy: { kind: "boolean" as const, label: "dummy", default: false } } as const;
type S = SettingsOf<typeof settings>;

export const ultimateTicTacMiniPlugin: GamePlugin<ConnectState, ConnectAction, typeof settings> = {
  id: "ultimate-tic-tac-mini",
  title: "Ultimate Tic-Tac-Toe (Mini)",
  category: "board",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Nine-mini-grid Tic-Tac-Toe — simplified to a single 9×9 grid with three-in-a-row.",
  howToPlay: "Ultimate Tic-Tac-Toe is a meta-game where each cell of an outer 3×3 grid contains a full inner 3×3 Tic-Tac-Toe. Winning an inner board claims the corresponding outer cell, and the first to win three outer cells in a row wins overall. This Mini edition simplifies the meta-game into a single 9×9 grid where three-in-a-row anywhere wins.\n\nYou play first as red against a random CPU as blue. Click any empty cell to place your mark. The CPU plays a random legal move. The first player to align three marks in a row, column, or diagonal wins.\n\nThe board displays as a 9×9 grid. Your marks show red; the CPU's marks show blue. Filled cells are not selectable.\n\nWith 81 cells and only three-in-a-row required, games end fast. The strong move is clustering near the center: central cells participate in the most three-in-a-row lines. The CPU plays random legal moves, so building two open-twos in different directions reliably wins. A win scores 100 plus a per-piece bonus; a draw scores 25; loss is zero.",
  settings,
  initialState: (seed: number, s: S) => initialState(seed, s as ConnectSettings),
  reducer,
  isTerminal,
  hint: (): HintTarget | null => (typeof document !== "undefined" && document.querySelector(".ultttt-mini-grid")) ? { selector: ".ultttt-mini-grid", pulses: 3 } : null,
  component: ConnectGame,
};
