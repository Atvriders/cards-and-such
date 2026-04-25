import type { GamePlugin } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { RacingStuntsState, RacingStuntsAction } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { RacingStuntsGame } from "./Game.js";

export const racingStuntsSettings = {
  laps: {
    kind: "enum" as const,
    label: "Laps",
    options: ["3", "5"] as const,
    default: "3" as const,
  },
} as const;

type RacingStuntsSettingsType = SettingsOf<typeof racingStuntsSettings>;

export const racingStuntsPlugin: GamePlugin<RacingStuntsState, RacingStuntsAction, typeof racingStuntsSettings> = {
  id: "racing-stunts",
  title: "Racing Stunts",
  category: "arcade",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Race across laps and pull off drifts, jumps, and boosts in stunt zones for bonus points.",
  howToPlay: `Racing Stunts puts you behind the wheel of a stunt car. Your goal is to complete all laps as fast as possible while pulling off spectacular tricks in stunt zones to rack up a high score.

Click Accelerate to increase your speed and advance along the track. Each press moves your car forward based on your current speed — higher speed means bigger advances each turn. After crossing the finish line, your speed resets slightly at the start of the new lap.

As you race, stunt zones appear randomly. When you enter a stunt zone you can choose from three tricks: Drift (low risk, moderate reward), Jump (medium risk and reward), or Boost (high risk, highest reward). Each stunt is resolved with a random roll — you can land a Perfect (double points), Good (standard points), or Fail (no points, possible crash).

A Boost stunt also increases your speed by 2 on a success, helping you zoom through the next section faster.

Your total score accumulates from successful stunts. Complete 3 or 5 laps depending on your chosen setting. The game ends when you cross the finish of the last lap. Maximum score is capped at 1000.

Tips: Accelerate aggressively early to build speed. In stunt zones, Drift is the safe choice while Boost is high risk — go for Boost when you are feeling lucky or need a speed surge.`,
  settings: racingStuntsSettings,
  initialState: (seed: number, settings: RacingStuntsSettingsType) => initialState(seed, settings),
  reducer,
  isTerminal,
  component: RacingStuntsGame,
};
