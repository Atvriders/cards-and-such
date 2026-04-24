import type { GamePlugin } from "../../platform/game-plugin/types.js";
import type { GalaxyFormationState, GalaxyFormationAction } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { GalaxyFormation } from "./GalaxyFormation.js";

export const galaxyFormationPlugin: GamePlugin<GalaxyFormationState, GalaxyFormationAction, Record<never, never>> = {
  id: "galaga-like",
  title: "Galaxy Formation",
  category: "arcade",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Classic space shooter. Defend against alien formations diving toward you.",
  howToPlay: `Pilot your ship at the bottom of the screen and destroy the alien formation before they destroy you.

Move left and right with the arrow keys or A/D. Press Space or click to fire upward — you can have up to two bullets in flight at once. Enemies are arranged in four rows of eight and slowly drift left and right. Periodically, individual enemies break formation and dive toward your ship in a swooping attack.

Shoot enemies before they reach you. Enemy fire comes from random formation members — dodge by moving laterally. After destroying the entire formation, the next wave begins with enemies that move and fire slightly faster. Clear three waves to win.

Scoring: each enemy destroyed is worth 100 points. Survive all three waves for a lives bonus. You have three lives total. After being hit you get two seconds of invincibility (your ship flashes) to reposition safely. Diving enemies are worth the same as formation enemies, but they are harder to hit.

Tips: Clear the bottom row first to reduce enemy fire coverage. When an enemy dives, lead your shot to intercept its path rather than aiming at its current position. Never stand still — constant lateral movement makes you harder to hit.`,
  settings: {} as Record<never, never>,
  initialState: (seed: number) => initialState(seed),
  reducer,
  isTerminal,
  component: GalaxyFormation,
};
