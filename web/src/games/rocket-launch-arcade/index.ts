import type { GamePlugin } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { RocketLaunchState, RocketLaunchAction } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { RocketLaunchGame } from "./Game.js";

export const rocketLaunchArcadeSettings = {
  difficulty: {
    kind: "enum" as const,
    label: "Difficulty",
    options: ["easy", "normal", "hard"] as const,
    default: "normal" as const,
  },
} as const;

type RocketLaunchArcadeSettings = SettingsOf<typeof rocketLaunchArcadeSettings>;

export const rocketLaunchArcadePlugin: GamePlugin<RocketLaunchState, RocketLaunchAction, typeof rocketLaunchArcadeSettings> = {
  id: "rocket-launch-arcade",
  title: "Rocket Launch",
  category: "arcade",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Align your rocket over the target, then launch for maximum points — but every move costs precious fuel.",
  howToPlay: `Rocket Launch is a precision arcade game. Each round a target zone appears somewhere across a nine-column grid. Your rocket starts in the center column. Use the Left and Right buttons to slide your rocket toward the target, then press Launch to fire.

Every move left or right spends one fuel unit. You begin each round with a full tank, but fuel does not replenish between moves — only between rounds. Plan your path carefully: if you run out of fuel you must launch from wherever you are.

Scoring rewards accuracy and efficiency. A direct hit on the target earns a base 100 points plus a fuel bonus equal to your remaining fuel multiplied by 10. A miss earns nothing. The target position changes randomly each round.

Difficulty affects your starting fuel and the number of rounds. Easy gives 30 fuel over 10 rounds, Normal gives 20 fuel over 8 rounds, and Hard cuts you to just 12 fuel over 6 rounds.

Win by finishing with more hits than misses. Maximize your score by minimizing unnecessary sideways movement — count the columns between your rocket and the target before moving, then commit to that path. Fast, clean launches are the key to a top score.`,
  settings: rocketLaunchArcadeSettings,
  initialState: (seed: number, settings: RocketLaunchArcadeSettings) => initialState(seed, settings),
  reducer,
  isTerminal,
  component: RocketLaunchGame,
};
