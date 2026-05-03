import type { GamePlugin } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { SpaceArenaState, SpaceArenaAction } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { SpaceArena } from "./SpaceArena.js";

export const spaceArenaSettings = {
  difficulty: {
    kind: "enum" as const,
    label: "Difficulty",
    options: ["easy", "normal", "hard"] as const,
    default: "normal",
  },
} as const;

type SpaceArenaSettingsType = SettingsOf<typeof spaceArenaSettings>;

export const spaceArenaPlugin: GamePlugin<SpaceArenaState, SpaceArenaAction, typeof spaceArenaSettings> = {
  id: "space-arena",
  title: "Space Arena",
  category: "arcade",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Pilot your ship across 9 columns, shoot alien invaders, and survive rising waves.",
  howToPlay: `Space Arena is a fast-paced arcade shooter. You pilot a rocket at the bottom of a 9-column grid. Alien ships appear at the top and fire down at you. Your mission: shoot them before they destroy you.

Controls: click Left and Right to move your ship one column at a time. Click Shoot to fire a blue bullet straight up — it travels row by row until it hits an enemy or leaves the grid. Each enemy you destroy earns 10 points.

The Shield button activates a one-hit barrier that blocks the next enemy projectile. After use, the shield enters a cooldown of 10 ticks before you can use it again. The shield indicator shows "ready" or the remaining cooldown count.

Enemies spawn randomly across columns and have 1–3 HP depending on the wave. As waves progress, enemies grow tougher and fire more frequently. You start with 5 HP — each enemy bullet that hits you costs one HP. Reaching zero ends the game.

Difficulty controls the tick rate and enemy intensity: Easy gives slower ticks and weaker enemies; Hard is faster with armoured foes. Plan your shield timing carefully — catching a bullet during a cluster attack can save your run.

Score is capped at 100 (representing up to 300 kills). Survive as long as possible and aim for efficient shooting!`,
  settings: spaceArenaSettings,
  initialState: (seed: number, settings: SpaceArenaSettingsType) => initialState(seed, settings),
  reducer,
  isTerminal,
  hint: (s: any) => { const p = (s as any).phase; if (p === "gameover" || p === "done" || p === "ended" || (s as any).gameOver) return null; return { selector: '[data-testid="hint-target-space-arena-action"]', pulses: 3 }; },
  component: SpaceArena,
};
