import type { GamePlugin, HintTarget } from "../../platform/game-plugin/types.js";
import type { SeegaState, SeegaAction, SeegaSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { Seega } from "./Game.js";

const settings = {} as const;

export const seegaPlugin: GamePlugin<SeegaState, SeegaAction, typeof settings> = {
  id: "seega",
  title: "Seega",
  category: "board",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Ancient Egyptian strategy game — place pieces two at a time then sandwich opponents to capture.",
  howToPlay: `Seega is one of Egypt's oldest strategy games, played on a 5×5 grid. The center square is always kept empty. You play gold pieces; the bot plays dark pieces. Each player has 12 pieces.

The game has two phases. In the Placement phase, players alternate placing two pieces each turn on any empty square — except the center. Pieces already on the board cannot capture during placement. Once all 24 pieces are placed, the Movement phase begins.

In the Movement phase, you move one piece orthogonally (up, down, left, right) to an adjacent empty square per turn — the center square remains off-limits. Capture by custodianship: if your move sandwiches one or more of your opponent's pieces between two of yours along a straight line, those pieces are removed. You can capture in multiple directions in a single move.

Win by capturing all of the opponent's pieces, or by leaving them with no legal moves. The bot uses minimax search at depth 3. Plan ahead to create multiple simultaneous threats — Seega rewards positional thinking and patience.`,
  settings,
  initialState: (seed: number, s: SeegaSettings) => initialState(seed, s),
  reducer,
  isTerminal,
  hint: (): HintTarget | null => (typeof document !== "undefined" && document.querySelector(".seega-board")) ? { selector: ".seega-board", pulses: 3 } : null,
  component: Seega,
};
