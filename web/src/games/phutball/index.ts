import type { GamePlugin } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { PhutballState, PhutballAction } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { Phutball } from "./Phutball.js";

export const phutballSettings = {
  opponent: {
    kind: "enum" as const,
    label: "Opponent",
    options: ["bot", "hot-seat"] as const,
    default: "bot",
  },
} as const;

type PhutballSettingsType = SettingsOf<typeof phutballSettings>;

export const phutballPlugin: GamePlugin<PhutballState, PhutballAction, typeof phutballSettings> = {
  id: "phutball",
  title: "Phutball",
  category: "board",
  players: { min: 1, max: 2, multiplayer: false },
  description: "Philosopher's Football: jump the ball over men to score at the opponent's end.",
  howToPlay: `Phutball (Philosopher's Football) is a two-player combinatorial game invented by John Conway. The board is 7×9. A single ball starts at the center. You play as White and aim to land the ball in or past row 0 (the top edge). The bot plays Black and aims for row 6 (the bottom edge).

On each turn you may do one of two things. First option: place a man (a neutral stone) on any empty cell — this does not move the ball. Second option: jump the ball. The ball leaps over one or more consecutive men in a straight line (horizontally, vertically, or diagonally), removing all jumped men, and lands just beyond the last man. You may chain multiple jumps in one turn by picking new directions after each leap. When you are done jumping, click End Jump to pass the turn.

A player wins when the ball lands on or crosses their goal row. A jump that carries the ball off the board in the direction of your goal also counts as a score.

Strategy: place men to create jump runways that carry the ball toward your goal, while blocking paths the opponent might use. Long chains of men can launch the ball across the entire board in one turn.`,
  settings: phutballSettings,
  initialState: (seed: number, settings: PhutballSettingsType) => initialState(seed, settings),
  reducer,
  isTerminal,
  component: Phutball,
};
