import type { GamePlugin } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { TankState, TankAction } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { TankBattle } from "./TankBattle.js";

export const tankBattleSettings = {
  gridSize: {
    kind: "enum" as const,
    label: "Map size",
    options: ["10", "14", "18"] as const,
    default: "14" as const,
  },
} as const;

type TankBattleSettingsType = SettingsOf<typeof tankBattleSettings>;

export const tankBattlePlugin: GamePlugin<TankState, TankAction, typeof tankBattleSettings> = {
  id: "tank-battle",
  title: "Tank Battle",
  category: "arcade",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Navigate a walled arena and destroy enemy tanks before they destroy you.",
  howToPlay: `Guide your tank through a maze of walls and blast every enemy tank off the map. You are the blue tank (▲); red tanks (▼) are your enemies.

Move with Arrow keys or WASD. Press Space or F to fire a bullet in the direction your tank is currently facing. Your shots travel in a straight line and disappear when they hit a wall.

Enemy tanks roam the arena, bouncing off walls, and periodically fire at you. Their orange bullets are slower than yours but deadly — one hit costs you a life. You begin with three lives; lose them all and the game ends.

Destroying an enemy scores 100 points. Clearing all enemies from the map earns a 500-point bonus. Bullets from either side are blocked by walls, so use the terrain strategically: herd enemies into open corridors, then fire from safety.

Smaller maps have fewer enemies but tighter quarters — harder to dodge. Larger maps spread more enemies across more open space, requiring longer pursuit.

Tip: Always face the nearest threat before shooting. Moving and aiming simultaneously is key — tap a direction to aim, then fire before repositioning.`,
  settings: tankBattleSettings,
  initialState: (seed: number, settings: TankBattleSettingsType) => initialState(seed, settings),
  reducer,
  isTerminal,
  component: TankBattle,
};
