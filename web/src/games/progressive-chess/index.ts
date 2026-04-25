import type { GamePlugin } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { ProgressiveState, ProgressiveAction } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { ProgressiveChessGame } from "./Game.js";

export const progressiveSettings = {
  opponent: {
    kind: "enum" as const,
    label: "Difficulty",
    options: ["easy", "medium", "hard"] as const,
    default: "medium",
  },
} as const;

type ProgressiveSettingsType = SettingsOf<typeof progressiveSettings>;

export const progressiveChessPlugin: GamePlugin<ProgressiveState, ProgressiveAction, typeof progressiveSettings> = {
  id: "progressive-chess",
  title: "Progressive Chess",
  category: "board",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Each turn, players make more moves: White plays 1, Black plays 2, White plays 3, Black plays 4, and so on.",
  howToPlay: `Progressive Chess is one of the most creative chess variants. Instead of alternating single moves, each "series" allows more moves: White makes 1 move, then Black makes 2 moves, then White makes 3 moves, then Black makes 4, and so on. The series count increases by one each time a side completes their turn.

All standard piece movements and rules apply within each series. However, there's a key restriction: you may NOT give check to the opponent's king except on the very last move of your series. Mid-series checks are forbidden! But a checkmate on any move — even the last of your series — ends the game immediately.

If your king is in check at the start of your series, your first move must deal with the check (escape, block, or capture the attacker). After that, you can play your remaining moves freely.

Pawn promotion works normally, and castling is available if rights haven't been lost. The en passant window resets after each individual move.

The game accelerates dramatically. Black's two-move response compensates for White's first-move advantage. By series 5 or 6, both sides have sweeping multi-move turns that can reshape the board completely. Deep calculation of multi-move combinations is key.

The series dots in the UI track your progress through each series. Green dots = moves made, grey = remaining. You play White; the bot plays Black.`,
  settings: progressiveSettings,
  initialState: (seed: number, settings: ProgressiveSettingsType) => initialState(seed, settings),
  reducer,
  isTerminal,
  component: ProgressiveChessGame,
};
