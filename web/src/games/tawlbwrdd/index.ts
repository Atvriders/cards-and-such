import type { GamePlugin, HintTarget } from "../../platform/game-plugin/types.js";
import type { TawlbwrddState, TawlbwrddAction, TawlbwrddSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { Tawlbwrdd } from "./Game.js";

const settings = {} as const;

export const tawlbwrddPlugin: GamePlugin<TawlbwrddState, TawlbwrddAction, typeof settings> = {
  id: "tawlbwrdd",
  title: "Tawlbwrdd",
  category: "board",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Large Welsh tafl on 11×11. Escort the king to a corner past 24 attackers.",
  howToPlay: `Tawlbwrdd (pronounced roughly "towl-boorth") is a medieval Welsh tafl game. It is played on an 11×11 board. You command the defenders: one king and 12 defenders. The bot commands 24 attackers arranged on the edges.

Attackers move first. You move second. Pieces slide any number of squares orthogonally like a chess rook, but cannot jump over other pieces. Only the king may land on a corner or the central throne square. No other piece may stop there.

Capture is custodian style: if your piece is flanked on two opposing sides (orthogonally) by enemies — or by an enemy and a hostile square such as a corner or the empty throne — it is removed from the board. The king requires all four orthogonal squares to be occupied by attackers (or hostile squares) before it is captured.

You win by moving the king to any of the four corner squares. The bot wins by surrounding and capturing the king.

The larger board compared to smaller tafl variants gives the king more room to manoeuvre, but also gives the attackers more room to set multi-directional blocks. Coordinate defenders as escorts while the king seeks an open diagonal path toward a corner.`,
  settings,
  initialState: (seed: number, s: TawlbwrddSettings) => initialState(seed, s),
  reducer,
  isTerminal,
  hint: (): HintTarget | null => (typeof document !== "undefined" && document.querySelector(".tawlbwrdd-grid")) ? { selector: ".tawlbwrdd-grid", pulses: 3 } : null,
  component: Tawlbwrdd,
};
