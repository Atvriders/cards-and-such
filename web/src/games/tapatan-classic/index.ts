import type { GamePlugin, SettingsOf } from "../../platform/game-plugin/types.js";
import type { ConnectState, ConnectAction, ConnectSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { ConnectGame } from "./Game.js";

const settings = { dummy: { kind: "boolean" as const, label: "dummy", default: false } } as const;
type S = SettingsOf<typeof settings>;

export const tapatanClassicPlugin: GamePlugin<ConnectState, ConnectAction, typeof settings> = {
  id: "tapatan-classic",
  title: "Tapatan (Classic)",
  category: "board",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Filipino three-in-a-row with sliding moves; classic placement variant.",
  howToPlay: "Tapatan is the Filipino three-in-a-row game played on a 3×3 grid with diagonals. The standard game has a placement phase followed by a sliding phase where pieces move to adjacent points. This Classic edition uses placement only on the 3×3 grid for a quick session.\n\nYou play first against a random CPU. Click any empty cell to place a stone. The CPU plays a random legal move. The first player to align three stones in a row, column, or diagonal wins.\n\nThe board displays as a 3×3 grid. Your stones show red; the CPU's stones show blue. Filled cells are not selectable.\n\nTapatan tactics, like Tic-Tac-Toe, revolve around center control: the center cell participates in the most winning lines. With a random CPU, taking the center and watching for the CPU to skip a block almost always converts to a win. A win scores 100 points plus a small piece bonus; a draw scores 25; a loss scores zero. Aim for short three-piece wins for top scores.",
  settings,
  initialState: (seed: number, s: S) => initialState(seed, s as ConnectSettings),
  reducer,
  isTerminal,
  hint: (state) => state.phase === "playing" && state.turn === "P" ? { selector: ".cn-cell:not(.p):not(.c)", pulses: 3 } : null,
  component: ConnectGame,
};
