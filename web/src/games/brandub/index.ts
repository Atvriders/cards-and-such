import type { GamePlugin, HintTarget } from "../../platform/game-plugin/types.js";
import type { BrandubState, BrandubAction, BrandubSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { Brandub } from "./Game.js";

const settings = {} as const;

export const brandubPlugin: GamePlugin<BrandubState, BrandubAction, typeof settings> = {
  id: "brandub",
  title: "Brandub",
  category: "board",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Ancient Irish tafl game. Escort the king to a corner past the encircling attackers.",
  howToPlay: `Brandub is an ancient Irish board game of the tafl family, played on a 7×7 grid. You command the defenders: one king and four defenders. The bot commands eight attackers who start on the edges.

You move first. Click any of your pieces to select it, then click a highlighted square to move it. Pieces slide any number of squares horizontally or vertically like a rook in chess, but may not pass through other pieces. No piece except the king may land on a corner or the central throne square.

Capture is custodian style: if you sandwich an enemy piece between two of your pieces (or a corner/empty throne) along a row or column, it is removed. The king requires all four surrounding squares to be hostile before it is captured.

You win by moving the king to any of the four corner squares. The bot wins by surrounding the king on all four sides.

Strategy: open corridors for the king early, use defenders to block attacker lanes, and watch for multi-captures. The bot plays random valid moves, so consistent piece coordination will win reliably.`,
  settings,
  initialState: (seed: number, s: BrandubSettings) => initialState(seed, s),
  reducer,
  isTerminal,
  hint: (): HintTarget | null => (typeof document !== "undefined" && document.querySelector(".brandub-grid")) ? { selector: ".brandub-grid", pulses: 3 } : null,
  component: Brandub,
};
