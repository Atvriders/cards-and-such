import type { GamePlugin, SettingsOf , HintTarget} from "../../platform/game-plugin/types.js";
import type { ConnectState, ConnectAction, ConnectSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { ConnectGame } from "./Game.js";

const settings = { dummy: { kind: "boolean" as const, label: "dummy", default: false } } as const;
type S = SettingsOf<typeof settings>;

export const wildTicMiniPlugin: GamePlugin<ConnectState, ConnectAction, typeof settings> = {
  id: "wild-tic-mini",
  title: "Wild Tic-Tac-Toe (Mini)",
  category: "board",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Each turn, choose to place X or O; first to make three of either wins.",
  howToPlay: "Wild Tic-Tac-Toe is a Tic-Tac-Toe variant where on each turn either player can choose to place either an X or an O. Whoever first creates a line of three of either symbol wins. This Mini edition uses a 3×3 board for a fast game.\n\nIn this simplified implementation you control X-placement on the standard board against a random CPU. Click any empty cell to place your mark. The CPU then plays a random move (also using X for visualization). The first row, column, or diagonal of three identical marks wins for whoever moved last to complete it.\n\nThe board displays as a 3×3 grid. Filled cells are not selectable.\n\nWild Tic-Tac-Toe tactics emphasize short-term threats since either player can complete a line. Always check whether your next move would be hijacked by the CPU's matching mark. Because the CPU plays random moves, you can build double threats reliably. A win scores 100 plus a piece bonus; a draw is 25; loss is zero.",
  settings,
  initialState: (seed: number, s: S) => initialState(seed, s as ConnectSettings),
  reducer,
  isTerminal,
  hint: (): HintTarget | null => (typeof document !== "undefined" && document.querySelector(".wildmini-board")) ? { selector: ".wildmini-board", pulses: 3 } : null,
  component: ConnectGame,
};
