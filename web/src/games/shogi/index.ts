import { lazy } from "react";
import type * as React from "react";
import type { GamePlugin, HintTarget } from "../../platform/game-plugin/types.js";
import type { ShogiState, ShogiAction, ShogiSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
const Shogi = /* @__PURE__ */ lazy(() => import("./Game.js").then((mod) => ({ default: mod.Shogi as unknown as React.ComponentType<unknown> })));
const settings = {} as const;

export const shogiPlugin: GamePlugin<ShogiState, ShogiAction, typeof settings> = {
  id: "shogi",
  title: "Shogi",
  category: "board",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Japanese Chess — promote pieces and drop captured pieces back onto the board.",
  howToPlay: `Shogi (Japanese Chess) is played on a 9×9 board. You play Sente (moving upward); the bot plays Gote (moving downward). Capture the enemy King to win.

Pieces and movement: King moves one step in any direction. Rook slides orthogonally; Bishop slides diagonally. Gold General moves one step orthogonally or diagonally forward. Silver General moves one step diagonally or straight forward. Knight jumps in a forward L-shape (2 forward, 1 sideways). Lance slides straight forward only. Pawn moves one step forward.

Promotion: when a piece enters the opponent's promotion zone (the far three rows), it may promote. Promoted pieces gain enhanced movement — promoted Rook can also step diagonally, promoted Bishop can also step orthogonally; Pawns, Silvers, Knights, and Lances all promote to move like a Gold General. Promotion is automatic in this version when moves enter the zone.

Drops: captured pieces go into your hand. On any turn instead of moving a piece on the board, you may drop a piece from your hand onto any empty square. You cannot drop a Pawn, Lance, or Knight on ranks where they could never move.

Click a piece to select it; click a highlighted square to move. Click a piece in your hand to select it for dropping, then click an empty square. The bot plays at depth 2.`,
  settings,
  initialState: (seed: number, s: ShogiSettings) => initialState(seed, s),
  reducer,
  isTerminal,
  hint: (): HintTarget | null => (typeof document !== "undefined" && document.querySelector(".shogi-board-wrap")) ? { selector: ".shogi-board-wrap", pulses: 3 } : null,
  component: Shogi,
};
