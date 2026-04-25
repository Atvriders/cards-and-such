import type { GamePlugin } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { CrazyhouseState, CrazyhouseAction } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { CrazyhouseGame } from "./Game.js";

export const crazyhouseSettings = {
  opponent: {
    kind: "enum" as const,
    label: "Difficulty",
    options: ["easy", "medium", "hard"] as const,
    default: "medium",
  },
} as const;

type CrazyhouseSettingsType = SettingsOf<typeof crazyhouseSettings>;

export const crazyhousePlugin: GamePlugin<CrazyhouseState, CrazyhouseAction, typeof crazyhouseSettings> = {
  id: "crazyhouse",
  title: "Crazyhouse",
  category: "board",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Captured pieces switch sides and can be dropped back onto the board. Explosive tactical chess!",
  howToPlay: `Crazyhouse is a wildly tactical chess variant where captured pieces don't leave the game — they change sides! When you capture an opponent's piece, it enters your "pocket." On any future turn, instead of making a normal move, you can drop a piece from your pocket onto any empty square on the board.

All standard chess rules apply for normal moves. Dropping has a few restrictions: pawns cannot be dropped on rank 1 or rank 8 (you can't drop a pawn directly to promotion). A drop cannot leave your own king in check. Dropped pieces can immediately give check.

Promoted pawns that are captured return to the pocket as pawns. This keeps the pawn supply balanced.

Strategy changes dramatically from regular chess. Material never truly disappears — a sacrificed piece comes back against you! Threats are everywhere: an opponent with several pieces in their pocket can suddenly create multiple threats from unexpected squares. Defence and coordination become crucial.

To use your pocket: click a piece button in your pocket area to select it (it highlights in blue), then click any valid square on the board to drop it. To switch back to moving pieces on the board, click a piece on the board. The green squares show valid drop targets.

You play White; the bot plays Black. Checkmate wins; stalemate draws.`,
  settings: crazyhouseSettings,
  initialState: (seed: number, settings: CrazyhouseSettingsType) => initialState(seed, settings),
  reducer,
  isTerminal,
  component: CrazyhouseGame,
};
