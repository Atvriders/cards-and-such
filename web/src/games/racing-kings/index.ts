import type { GamePlugin, HintTarget } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { RacingKingsState, RacingKingsAction } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { RacingKingsGame } from "./Game.js";

export const racingKingsSettings = {
  opponent: {
    kind: "enum" as const,
    label: "Difficulty",
    options: ["easy", "medium", "hard"] as const,
    default: "medium",
  },
} as const;

type RacingKingsSettingsType = SettingsOf<typeof racingKingsSettings>;

export const racingKingsPlugin: GamePlugin<RacingKingsState, RacingKingsAction, typeof racingKingsSettings> = {
  id: "racing-kings",
  title: "Racing Kings",
  category: "board",
  players: { min: 1, max: 1, multiplayer: false },
  description: "A chess variant where both players race their kings to the 8th rank. No pawns, no checks allowed.",
  howToPlay: `Racing Kings is a thrilling chess variant with a completely different goal: race your king to rank 8 (the far edge of the board) before your opponent does. There are no pawns in Racing Kings.

All pieces move as in standard chess — kings, queens, rooks, bishops, and knights move normally. However, there is a critical rule: you are never allowed to give check to the opponent's king, nor may you leave your own king in check. Every legal move must leave both kings out of check. This rule forces creative and careful maneuvering.

White moves first. If White's king reaches rank 8, Black gets exactly one more move to also reach rank 8. If Black succeeds, the game is a draw; otherwise, White wins. If Black reaches rank 8 without White having done so first, Black wins immediately.

The starting position has all pieces on the bottom two ranks: each player starts with two rooks, two bishops, two knights, one queen, and one king. The board is empty above, giving kings many paths to sprint toward victory.

Click a piece to select it, then click a highlighted square to move. You play White; the bot plays Black.`,
  settings: racingKingsSettings,
  initialState: (seed: number, settings: RacingKingsSettingsType) => initialState(seed, settings),
  reducer,
  isTerminal,
  hint: (): HintTarget | null => (typeof document !== "undefined" && document.querySelector(".rkpb-wrap")) ? { selector: ".rkpb-wrap", pulses: 3 } : null,
  component: RacingKingsGame,
};
