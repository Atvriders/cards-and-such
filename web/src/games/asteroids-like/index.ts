import type { GamePlugin, HintTarget } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { AsteroidsState, AsteroidsAction } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { Asteroids } from "./Asteroids.js";

export const asteroidsSettings = {
  startingAsteroids: {
    kind: "enum" as const,
    label: "Starting asteroids",
    options: ["5", "8", "12"] as const,
    default: "5" as const,
  },
} as const;

type AsteroidsSettingsType = SettingsOf<typeof asteroidsSettings>;

export const asteroidsPlugin: GamePlugin<AsteroidsState, AsteroidsAction, typeof asteroidsSettings> = {
  id: "asteroids-like",
  title: "Asteroid Field",
  category: "board",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Pilot a ship in space. Shoot asteroids — they split into smaller chunks.",
  howToPlay: `Navigate a spaceship through an asteroid field and destroy every rock to clear the stage.

Press Left and Right arrow keys (or A / D) to rotate the ship. Hold Up or W to fire the thruster and accelerate in the direction you are facing. Your ship wraps around all edges of the play area. Press Space to shoot a bullet.

Large asteroids split into two medium ones when shot; medium asteroids split into two small ones; small asteroids disappear entirely. You score 20 points for a large asteroid, 50 for medium, and 100 for small. Clear all asteroids to win, earning a bonus of 200 × remaining lives.

You have 3 lives. Hitting an asteroid costs one life and resets you to the center with brief invincibility (the ship flickers). On hard settings with 12 starting asteroids the field quickly becomes densely packed — stay mobile and clear one size at a time.

Tips: large asteroids drift slowly; shoot from a safe distance. Small chunks are fast — clear them first before they fill the screen. Thrust in short bursts to maintain control; momentum carries you after releasing the key.`,
  settings: asteroidsSettings,
  initialState: (seed: number, settings: AsteroidsSettingsType) => initialState(seed, settings),
  reducer,
  isTerminal,
  hint: (): HintTarget | null => (typeof document !== "undefined" && document.querySelector(".asteroids-game")) ? { selector: ".asteroids-game", pulses: 3 } : null,
  component: Asteroids,
};
