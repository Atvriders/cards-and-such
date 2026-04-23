import type { GamePlugin } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { KKState, KKAction, KKSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { KingsAndKnights } from "./KingsAndKnights.js";

export const kkSettings = {
  difficulty: {
    kind: "enum" as const,
    label: "Difficulty",
    options: ["easy", "medium"] as const,
    default: "easy",
  },
} as const;

type KKSettingsType = SettingsOf<typeof kkSettings>;

export const kingsAndKnightsPlugin: GamePlugin<KKState, KKAction, typeof kkSettings> = {
  id: "kings-and-knights",
  title: "Kings and Knights",
  category: "board",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Place kings and knights on a chessboard so no piece attacks another.",
  howToPlay: `Kings and Knights is a chess-themed placement puzzle. You are given a chessboard (6×6 or 8×8) and must place an exact number of kings and an exact number of knights on it so that no piece attacks any other piece.

A king attacks all eight surrounding squares (one step in any direction, including diagonals). A knight attacks in an L-shape: two squares in one direction and one square perpendicular. A king can be attacked by another king, a king can be attacked by a knight, and a knight can be attacked by another knight — all of these must be avoided simultaneously.

Some pieces are pre-placed as clues (shown slightly dimmed). You cannot remove them. Your job is to place the remaining pieces.

To play: choose whether you want to place a King or a Knight using the toolbar buttons, then click any empty square to place that piece. Clicking a square that already holds a piece you placed will remove it. Conflicting pieces (that attack each other) are highlighted in red.

Strategy: kings occupy large "exclusion zones," so place them in widely separated corners or edges first. Knights have unusual attack patterns — two placed knights rarely conflict unless they are close, but watch for king–knight conflicts carefully.`,
  settings: kkSettings,
  initialState: (seed: number, settings: KKSettingsType) => initialState(seed, settings),
  reducer,
  isTerminal,
  component: KingsAndKnights,
};
