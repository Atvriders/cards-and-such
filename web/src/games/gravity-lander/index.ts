import type { GamePlugin } from "../../platform/game-plugin/types.js";
import type { GravityLanderState, GravityLanderAction, GravityLanderSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { GravityLander } from "./GravityLander.js";

export const gravityLanderSettings = {} as const;

export const gravityLanderPlugin: GamePlugin<
  GravityLanderState,
  GravityLanderAction,
  typeof gravityLanderSettings
> = {
  id: "gravity-lander",
  title: "Gravity Lander",
  category: "board",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Land your spaceship gently on the pad. Manage fuel, gravity and angle.",
  howToPlay: `You pilot a small spacecraft that starts near the top of the screen. Gravity continuously pulls you downward, and you have a limited fuel tank. Your goal is to land softly on the yellow landing pad on the terrain below.

Use the Left and Right arrow keys (or A / D) to rotate the ship. Hold the Up arrow or Space to fire the main thruster, which pushes the ship in the direction the nose is pointing. To slow your descent, point the nose upward and thrust carefully.

The HUD shows your current horizontal velocity (VX), vertical velocity (VY), and angle. To land safely you need all three to be within safe limits: vertical speed below 0.12, horizontal speed below 0.08, and angle within ±20° of vertical. Coming in too fast, too sideways, or tilted too far means a crash.

Score is fuel remaining × 2 plus a landing quality bonus (up to 100) based on how precisely you touched down. Conserve fuel by planning your descent early — gentle, controlled burns are far more efficient than last-second panic thrusting. The terrain is randomly generated each game, so the pad location changes every run.`,
  settings: gravityLanderSettings,
  initialState: (seed: number, settings: GravityLanderSettings) => initialState(seed, settings),
  reducer,
  isTerminal,
  component: GravityLander,
};
