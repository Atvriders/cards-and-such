import type { GamePlugin } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { ReversiState, ReversiAction } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { Reversi } from "./Reversi.js";

export const reversiSettings = {
  botDifficulty: {
    kind: "enum" as const,
    label: "Bot",
    options: ["easy", "medium", "hard"] as const,
    default: "medium" as const,
  },
} as const;

type ReversiSettingsType = SettingsOf<typeof reversiSettings>;

export const reversiPlugin: GamePlugin<ReversiState, ReversiAction, typeof reversiSettings> = {
  id: "reversi",
  title: "Reversi",
  category: "board",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Flank opponent discs to flip them. Most discs wins.",
  howToPlay: `Finish the game with more discs on the 8×8 board than your opponent. You play as Black (seat 0) and always move first; the bot plays as White.

Click any highlighted empty cell to place your disc there. A move is only legal if it flanks at least one straight line of opponent discs — horizontally, vertically, or diagonally — with your own disc on both ends. All flanked discs flip to your colour immediately. The bot responds automatically after each of your moves. If you have no legal move you must pass (a Pass button appears); if neither player has a legal move the game ends. The game also ends when the board is full. The player with more discs at the end wins.

Bot difficulty: Easy plays randomly; Medium uses minimax at depth 3 with a disc-count and corners heuristic; Hard uses minimax at depth 5 with enhanced corner and mobility weighting.

Scoring: win = 100 + (your discs − opponent discs) × 5; draw = 50; loss = max(0, your discs − 10).

Tips: corners are extremely valuable — once taken they can never be flipped. Avoid placing next to an empty corner as it hands the bot an easy corner grab.`,
  settings: reversiSettings,
  initialState: (seed: number, settings: ReversiSettingsType) => initialState(seed, settings),
  reducer,
  isTerminal,
  component: Reversi,
};
