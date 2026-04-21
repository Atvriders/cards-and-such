import type { GamePlugin } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { CheckersState, CheckersAction } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { Checkers } from "./Checkers.js";

export const checkersSettings = {
  mandatoryCapture: {
    kind: "boolean" as const,
    label: "Mandatory Capture",
    default: true,
  },
  opponent: {
    kind: "enum" as const,
    label: "Opponent",
    options: ["bot", "hot-seat"] as const,
    default: "bot",
  },
  botDepth: {
    kind: "enum" as const,
    label: "Bot Depth",
    options: ["2", "3", "4"] as const,
    default: "2",
  },
} as const;

type CheckersSettingsType = SettingsOf<typeof checkersSettings>;

export const checkersPlugin: GamePlugin<CheckersState, CheckersAction, typeof checkersSettings> = {
  id: "checkers",
  title: "Checkers",
  category: "board",
  players: { min: 1, max: 2, multiplayer: false },
  description: "American Checkers with mandatory capture and king promotion.",
  howToPlay: `Capture all of the opponent's pieces, or leave them with no legal moves, to win. You play as Red; the bot plays as Black.

Click a red piece to select it, then click a highlighted destination to move. Pieces move diagonally forward one square at a time onto empty dark squares. To capture an opponent's piece, jump over it to the empty square beyond — captures are chained automatically when multiple jumps are available from the same piece. With Mandatory Capture enabled (the default), you must take a capture move whenever one exists. Reach the opponent's back row to promote your piece to a King; Kings can move and capture in all four diagonal directions. Black (the bot) plays automatically after each of your moves. In Hot-seat mode, two humans alternate turns.

Bot Depth controls search depth (2 = faster/easier, 3 = moderate, 4 = strongest). The bot evaluates piece count, king count, advancement, and center control.

Scoring (vs bot only): win = remaining red pieces × 10; loss = 0.

Tips: aim to king your pieces early. Controlling the center gives your pieces more mobility.`,
  settings: checkersSettings,
  initialState: (seed: number, settings: CheckersSettingsType) => initialState(seed, settings),
  reducer,
  isTerminal,
  component: Checkers,
};
