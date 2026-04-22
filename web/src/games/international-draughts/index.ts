import type { GamePlugin } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { IDState, IDAction } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { InternationalDraughts } from "./InternationalDraughts.js";

export const internationalDraughtsSettings = {
  opponent: {
    kind: "enum" as const,
    label: "Difficulty",
    options: ["easy", "medium", "hard"] as const,
    default: "medium",
  },
} as const;

type IDSettingsType = SettingsOf<typeof internationalDraughtsSettings>;

export const internationalDraughtsPlugin: GamePlugin<IDState, IDAction, typeof internationalDraughtsSettings> = {
  id: "international-draughts",
  title: "International Draughts",
  category: "board",
  players: { min: 1, max: 1, multiplayer: false },
  description: "10×10 draughts with flying kings, forward and backward captures, and mandatory maximum-capture rule.",
  howToPlay: `International Draughts is played on a 10×10 board. Each side starts with 20 pieces (called men) on the dark squares of the first four rows. You play White (bottom); the bot plays Black (top). White moves first.

Men move diagonally forward one square. Unlike American checkers, men can capture in any diagonal direction — forward or backward. To capture, jump over an adjacent enemy piece and land on the empty square beyond. You must keep jumping in a chain if further captures are available.

The maximum-capture rule is mandatory: when multiple capture chains are possible, you must choose the one that captures the most pieces. You cannot make a short capture if a longer one exists.

When a man reaches the far rank, it is promoted to a King. Kings are "flying kings" — they slide any number of squares diagonally (like a bishop in chess), and can capture any enemy piece anywhere along a diagonal, then land any number of squares beyond.

The game ends when one player has no pieces left or no legal moves. Click a piece to select it, then click a highlighted destination. Yellow highlight = valid destination; red outline = must continue jumping from this piece.`,
  settings: internationalDraughtsSettings,
  initialState: (seed: number, settings: IDSettingsType) => initialState(seed, settings),
  reducer,
  isTerminal,
  component: InternationalDraughts,
};
