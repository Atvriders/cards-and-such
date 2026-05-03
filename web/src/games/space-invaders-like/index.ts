import type { GamePlugin, HintTarget } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { SpaceInvadersState, SpaceInvadersAction } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { SpaceInvaders } from "./SpaceInvaders.js";

export const spaceInvadersSettings = {
  difficulty: {
    kind: "enum" as const,
    label: "Difficulty",
    options: ["easy", "medium", "hard"] as const,
    default: "medium" as const,
  },
} as const;

type SpaceInvadersSettingsType = SettingsOf<typeof spaceInvadersSettings>;

export const spaceInvadersPlugin: GamePlugin<SpaceInvadersState, SpaceInvadersAction, typeof spaceInvadersSettings> = {
  id: "space-invaders-like",
  title: "Space Raid",
  category: "board",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Shoot down alien invaders before they reach the bottom.",
  howToPlay: `Defend the planet by shooting down wave after wave of alien invaders before they descend to the surface.

Move your ship left and right with the Arrow keys or A / D. Press Space to fire. You can only have one player bullet in the air at a time — fire immediately after each shot lands.

Aliens march left and right in formation, stepping down each time they reach the edge of the screen. They also randomly drop bombs toward you. Avoid bombs and shoot as many aliens as possible. Top-row aliens are worth more points (30 each); lower-row aliens are worth less (10 each).

Clearing all aliens in a wave starts the next level with a 500-point bonus and faster marching speed. You have 3 lives. The game ends if an alien reaches the bottom or a bomb hits your ship.

Difficulty controls how fast aliens march and how often they drop bombs. On hard, the formation moves quickly and bombs fall frequently. Tips: work from the edges inward — clearing edge columns gives the formation more room to slide and delays descents. Take out the bottom rows first to reduce bomb threats.`,
  settings: spaceInvadersSettings,
  initialState: (seed: number, settings: SpaceInvadersSettingsType) => initialState(seed, settings),
  reducer,
  isTerminal,
  hint: (): HintTarget | null => (typeof document !== "undefined" && document.querySelector(".sinv-game")) ? { selector: ".sinv-game", pulses: 3 } : null,
  component: SpaceInvaders,
};
