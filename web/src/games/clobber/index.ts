import type { GamePlugin, HintTarget } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { ClobberState, ClobberAction } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { Clobber } from "./Clobber.js";

export const clobberSettings = {
  opponent: {
    kind: "enum" as const,
    label: "Opponent",
    options: ["bot", "hot-seat"] as const,
    default: "bot",
  },
} as const;

type ClobberSettingsType = SettingsOf<typeof clobberSettings>;

export const clobberPlugin: GamePlugin<ClobberState, ClobberAction, typeof clobberSettings> = {
  id: "clobber",
  title: "Clobber",
  category: "board",
  players: { min: 1, max: 2, multiplayer: false },
  description: "Capture opponent pieces by clobbering them. Last to move wins.",
  howToPlay: `Clobber is a two-player combinatorial game invented in 2001. The board starts completely filled: every cell holds a piece, alternating White and Black in a checkerboard pattern. You play as White.

On your turn, move one of your pieces to an orthogonally adjacent cell that contains an opponent's piece. Your piece replaces (clobbers) the opponent's piece — that piece is removed. You cannot move to an empty cell or to a cell occupied by your own piece.

The goal is to be the last player able to move. The player who faces no legal moves on their turn loses. Since pieces are only removed (never added), the game shrinks steadily until one side is immobilised.

Strategy tip: try to isolate small groups of the opponent's pieces so they become trapped. Avoid splitting your own pieces into disconnected clusters, as isolated pieces have fewer options.

Click a white piece to select it, then click a highlighted green target to clobber an adjacent black piece. The bot searches three moves ahead.`,
  settings: clobberSettings,
  initialState: (seed: number, settings: ClobberSettingsType) => initialState(seed, settings),
  reducer,
  isTerminal,
  hint: (): HintTarget | null => (typeof document !== "undefined" && document.querySelector(".clobber-grid")) ? { selector: ".clobber-grid", pulses: 3 } : null,
  component: Clobber,
};
