import type { GamePlugin, HintTarget } from "../../platform/game-plugin/types.js";
import type { TablutState, TablutAction, TablutSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { Tablut } from "./Game.js";

const settings = {} as const;

export const tablutPlugin: GamePlugin<TablutState, TablutAction, typeof settings> = {
  id: "tablut",
  title: "Tablut",
  category: "board",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Finnish Tafl variant — escort the King to the edge of the board.",
  howToPlay: `Tablut is a Finnish variant of the ancient Tafl family of Viking strategy games, played on a 9×9 board. You play as the Defenders: your King (♔) starts at the central throne, surrounded by 8 Defender soldiers. The bot controls 16 Attackers arranged on the edges. Attackers move first.

Your goal: move the King to any edge square of the board (row 0, row 8, column 0, or column 8). The Attackers win by capturing the King.

All pieces move like chess rooks — any number of squares in a straight line, no jumping. The central throne square can only be entered by the King; non-King pieces cannot pass through it, and the empty throne acts as a hostile square for sandwiching purposes.

Capture: sandwich an opponent's piece between two of yours orthogonally — the captured piece is removed. The King requires all four orthogonal sides to be blocked simultaneously to be captured.

To move: click one of your Defenders or the King to select it (highlighted yellow), then click a valid destination. The bot responds automatically. The key challenge is opening a path for the King while protecting it from four-sided encirclement. Bot depth: 2-ply minimax.`,
  settings,
  initialState: (seed: number, s: TablutSettings) => initialState(seed, s),
  reducer,
  isTerminal,
  hint: (): HintTarget | null => (typeof document !== "undefined" && document.querySelector(".tablut-board")) ? { selector: ".tablut-board", pulses: 3 } : null,
  component: Tablut,
};
