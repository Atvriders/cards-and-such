import type { GamePlugin, SettingsOf, HintTarget} from "../../platform/game-plugin/types.js";
import type { ConnectState, ConnectAction, ConnectSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { ConnectGame } from "./Game.js";

const settings = { dummy: { kind: "boolean" as const, label: "dummy", default: false } } as const;
type S = SettingsOf<typeof settings>;

export const connectFourClassicPlugin: GamePlugin<ConnectState, ConnectAction, typeof settings> = {
  id: "connect-four-classic",
  title: "Connect Four (Classic)",
  category: "board",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Drop discs into 7-column gravity grid; first to four in a row wins.",
  howToPlay: "Connect Four Classic is the iconic two-player connect-line game. Discs drop into a 7-column by 6-row gravity grid and stack from the bottom up. The first player to align four of their discs in a row, column, or diagonal wins.\n\nYou play first as red against a random CPU as blue. Click any column to drop your disc — it falls into the lowest empty cell of that column. The CPU then drops a random legal disc and play alternates until someone makes four in a row, or the entire grid fills (a draw).\n\nThe board is displayed as a 7×6 grid of circular slots inside a navy frame. Cells filled with your color show red; the CPU's discs show blue.\n\nKey Connect Four tactics: control the center column, where the most winning lines pass; build double threats so two columns each complete a four-in-a-row, and the CPU cannot block both. The CPU plays random moves, so disciplined center play and threat building consistently wins. A win earns 100 points plus a small bonus for each piece placed; a draw is worth 25 points.",
  settings,
  initialState: (seed: number, s: S) => initialState(seed, s as ConnectSettings),
  reducer,
  isTerminal,
    hint: (state): HintTarget | null => {
    if (state.phase === "done" || state.turn !== "P") return null;
    const COLS = 7;
    for (let c = 0; c < COLS; c++) {
      if (state.board[c] === null) {
        return { selector: `[data-testid="c4cl-col-${c}"]`, pulses: 3 };
      }
    }
    return null;
  },
  component: ConnectGame,
};
