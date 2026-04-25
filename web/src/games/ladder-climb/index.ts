import type { GamePlugin } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { LadderClimbState, LadderClimbAction, LadderClimbSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { LadderClimb } from "./Game.js";

const ladderClimbSettings = {
  rungs: { kind: "enum" as const, label: "Rungs", options: ["5", "10"] as const, default: "5" as const },
} as const;

type LadderClimbSettingsType = SettingsOf<typeof ladderClimbSettings>;

export const ladderClimbPlugin: GamePlugin<LadderClimbState, LadderClimbAction, typeof ladderClimbSettings> = {
  id: "ladder-climb",
  title: "Ladder Climb",
  category: "arcade",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Grab the moving grip at just the right moment to climb each rung. Miss and slip back down!",
  howToPlay: `Ladder Climb is a timing arcade game where you must grab a moving grip marker to climb each rung of a ladder.

A purple marker slides back and forth across a bar. The center 20% of the bar is the grip zone. Press GRAB when the marker is in the purple zone to successfully grab the rung.

A successful grab moves you up one rung and scores 20 points multiplied by your current rung number — higher rungs are worth more! A miss slips you back one rung and scores zero.

The grip speed increases as you climb higher, making it harder to nail perfect timing on the upper rungs. Grip speed also varies randomly each attempt.

Use Settings to choose 5 or 10 rungs. Reaching the top rung earns a total score based on all your successful grabs. Can you climb all the way without slipping?`,
  settings: ladderClimbSettings,
  initialState: (seed: number, settings: LadderClimbSettingsType) => initialState(seed, settings as LadderClimbSettings),
  reducer,
  isTerminal,
  component: LadderClimb,
};
