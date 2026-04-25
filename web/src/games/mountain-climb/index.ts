import type { GamePlugin } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { MountainClimbState, MountainClimbAction } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { MountainClimb } from "./MountainClimb.js";

export const mountainClimbSettings = {
  difficulty: {
    kind: "enum" as const,
    label: "Difficulty",
    options: ["easy", "medium", "hard"] as const,
    default: "medium" as const,
  },
} as const;

type MountainClimbSettingsType = SettingsOf<typeof mountainClimbSettings>;

export const mountainClimbPlugin: GamePlugin<MountainClimbState, MountainClimbAction, typeof mountainClimbSettings> = {
  id: "mountain-climb",
  title: "Mountain Climb",
  category: "arcade",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Jump up rocky platforms to reach the mountain summit before running out of lives.",
  howToPlay: `Mountain Climb is a platform arcade game where you control a brave climber (🧗) scaling a treacherous rock face. Your goal is to reach the target altitude before losing all your lives.

The mountain is displayed as an 8-row grid with 5 columns. Rocky platforms (🪨) are scattered across the grid. You start at the bottom on the starting platform. Use the Up arrow to jump to the platform directly above your current column. Use Left and Right arrows to shift one column sideways onto a neighbouring platform on the same row.

If you press Up and there is no platform in the cell above you, you slip and lose a life. On Easy difficulty you start with 5 lives, Medium gives 3, and Hard gives only 2. The altitude counter increases each time you successfully jump upward.

The target altitude is 20 on Easy, 25 on Medium, and 30 on Hard. Once you reach or exceed the target altitude, you reach the summit and win the round.

Scoring: winning earns 600 base points plus 100 per remaining life. Losing early still earns 20 points per unit of altitude gained. Press New Climb to generate a fresh mountain with randomly placed platforms.

Strategy tip: always look one row ahead before jumping up. Shift sideways first to align with a platform above rather than jumping blindly. Conserve lives by scouting the path before committing to each upward jump.`,
  settings: mountainClimbSettings,
  initialState: (seed: number, settings: MountainClimbSettingsType) => initialState(seed, settings),
  reducer,
  isTerminal,
  component: MountainClimb,
};
