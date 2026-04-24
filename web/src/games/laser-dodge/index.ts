import type { GamePlugin } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { LaserDodgeState, LaserDodgeAction } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { LaserDodge } from "./Game.js";

const laserDodgeSettings = {
  difficulty: {
    kind: "enum" as const,
    label: "Difficulty",
    options: ["easy", "normal", "hard"] as const,
    default: "normal" as const,
  },
} as const;

type LaserDodgeSettingsType = SettingsOf<typeof laserDodgeSettings>;

export const laserDodgePlugin: GamePlugin<LaserDodgeState, LaserDodgeAction, typeof laserDodgeSettings> = {
  id: "laser-dodge",
  title: "Laser Maze",
  category: "arcade",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Navigate your orb through a field of sweeping laser beams without getting zapped.",
  howToPlay: `A glowing orb sits in a field crisscrossed by moving laser beams. Your goal is simple: don't touch the lasers. They sweep back and forth across the arena — horizontal beams slide up and down, vertical beams slide left and right.

Move your mouse over the play area to reposition the orb, or use the Arrow Keys to nudge it incrementally. The orb follows your cursor directly. One touch of any laser ends the game immediately.

Your score is based on how long you survive multiplied by 10. New lasers are added periodically as time goes on, and the sweep speed of each beam gradually increases, making the arena progressively more dangerous.

Start with Easy for 2 lasers, Normal for 3, or Hard for 5. Even Easy becomes challenging as new lasers spawn over time.

Tips: Identify safe corridors between laser sweeps and position yourself inside one. Watch several lasers at once rather than focusing on just one. The beams have a predictable oscillation — you can learn their rhythm and cross quickly during the moment a laser passes. Stay away from walls where your movement is restricted.`,
  settings: laserDodgeSettings,
  initialState: (seed: number, settings: LaserDodgeSettingsType) => initialState(seed, settings),
  reducer,
  isTerminal,
  component: LaserDodge,
};
