import type { GamePlugin } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { ZombieSurvivalState, ZombieSurvivalAction } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { ZombieSurvival } from "./ZombieSurvival.js";

export const zombieSurvivalSettings = {
  difficulty: {
    kind: "enum" as const,
    label: "Difficulty",
    options: ["easy", "normal", "hard"] as const,
    default: "normal",
  },
} as const;

type ZombieSurvivalSettingsType = SettingsOf<typeof zombieSurvivalSettings>;

export const zombieSurvivalPlugin: GamePlugin<ZombieSurvivalState, ZombieSurvivalAction, typeof zombieSurvivalSettings> = {
  id: "zombie-survival",
  title: "Zombie Survival",
  category: "arcade",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Survive the zombie horde — move across 7 columns and shoot undead in your lane.",
  howToPlay: `Zombie Survival is an arcade shooter set during a zombie apocalypse. You stand at the bottom of a 7-column grid. Zombies spawn at the top and shamble downward one row per game tick. Your goal: shoot them before they reach you.

Controls: click Left and Right to step one column at a time. Click Shoot to fire upward in your current column, hitting the closest zombie in that lane. Each kill earns 10 points. You start with 20 ammo and gain 3 ammo every 8 ticks — don't waste shots on empty columns.

A wooden barricade sits at row 5 (one row above you). Zombies must pass through it before reaching you. While barricade HP remains, zombies hitting that row are slowed and absorb damage from the barricade before reaching you. Once barricade HP drops to zero, zombies flow freely to your row.

Zombies that reach your position cost you 1 HP each. You start with 5 HP. Lose all HP and the run ends. Day count advances every 20 ticks — higher days spawn tougher zombies.

Difficulty controls spawn speed and zombie HP. Hard spawns faster with tougher undead; Easy gives more time between waves. Stay mobile — clustering in one column lets zombies pile up in adjacent lanes.

Score is capped at 100. Aim for efficient kills and conserve ammo for red-eyed multi-HP zombies.`,
  settings: zombieSurvivalSettings,
  initialState: (seed: number, settings: ZombieSurvivalSettingsType) => initialState(seed, settings),
  reducer,
  isTerminal,
  component: ZombieSurvival,
};
