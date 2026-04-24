import type { GamePlugin } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { HotSeatState, HotSeatAction } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { HotSeat } from "./Game.js";

export const hotSeatSettings = {
  questions: {
    kind: "enum" as const,
    label: "Questions",
    options: ["10", "15", "20"] as const,
    default: "10" as const,
  },
} as const;

type HotSeatSettingsType = SettingsOf<typeof hotSeatSettings>;

export const hotSeatPlugin: GamePlugin<HotSeatState, HotSeatAction, typeof hotSeatSettings> = {
  id: "hot-seat",
  title: "Hot Seat",
  category: "cards",
  players: { min: 2, max: 20, multiplayer: false },
  description: "One person answers rapid-fire questions from the group!",
  howToPlay: `Hot Seat puts one person in the spotlight while everyone else gets to ask and listen. A question appears on screen and the person in the Hot Seat must answer it honestly. The rest of the group can ask follow-up questions, express disbelief, or share their own answers for comparison.

How to play: choose who goes first. That person is "in the hot seat" for the current question. Read the question aloud, let them answer, and allow a minute or two for group discussion before tapping Next.

Rotate who is in the hot seat after each question, or keep one person there for a full round before switching — whichever your group prefers.

The questions range from lighthearted to genuinely revealing. There are no wrong answers, but trying to dodge or give a boring answer is very much frowned upon by group tradition.

This game works best with groups who know each other reasonably well but want to go deeper. It is a fantastic alternative to generic small talk at a dinner party or gathering. Choose 10, 15, or 20 questions depending on your time and group energy.`,
  settings: hotSeatSettings,
  initialState: (seed: number, settings: HotSeatSettingsType) => initialState(seed, settings),
  reducer,
  isTerminal,
  component: HotSeat,
};
