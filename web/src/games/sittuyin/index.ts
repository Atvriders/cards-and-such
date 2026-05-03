import type { GamePlugin, HintTarget } from "../../platform/game-plugin/types.js";
import type { SittuyinState, SittuyinAction, SittuyinSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { Sittuyin } from "./Game.js";

const settings = {} as const;

export const sittuyinPlugin: GamePlugin<SittuyinState, SittuyinAction, typeof settings> = {
  id: "sittuyin",
  title: "Sittuyin",
  category: "board",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Burmese Chess — ancient chess variant with unique piece placement and diagonal generals.",
  howToPlay: `Sittuyin is the traditional chess of Burma (Myanmar), played on an 8×8 board. You play White (bottom); the bot plays Black (top). Checkmate the enemy King to win.

Pieces and movement: King (Sit-ke) moves one step in any direction. Thida (general) moves one step diagonally — she is the weakest "queen" of all chess variants. Ein (elephant) moves one step diagonally or leaps two steps diagonally, making it a surprisingly powerful piece. Myin (horse) moves in the standard L-shape like a knight. Yahhta (chariot) slides any number of squares orthogonally like a rook. Ne (pawn) moves one step forward and captures one step diagonally forward.

Promotion: when a pawn (Ne) reaches the last rank it promotes to a Thida. In the full game pawns can also promote when adjacent diagonally to your own Thida, but this simplified version uses last-rank promotion only.

Opening: in the traditional game both sides place their back-row pieces in their own territory. This version auto-places using a standard opening setup so you can start playing immediately.

Click a piece to select it; highlighted squares show legal moves. The bot plays at depth 2.`,
  settings,
  initialState: (seed: number, s: SittuyinSettings) => initialState(seed, s),
  reducer,
  isTerminal,
  hint: (): HintTarget | null => (typeof document !== "undefined" && document.querySelector(".sittuyin-board")) ? { selector: ".sittuyin-board", pulses: 3 } : null,
  component: Sittuyin,
};
