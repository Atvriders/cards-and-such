import type { GamePlugin } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { SwarmShootState, SwarmShootAction } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { SwarmShoot } from "./SwarmShoot.js";

export const swarmShootSettings = {
  difficulty: {
    kind: "enum" as const,
    label: "Difficulty",
    options: ["easy", "medium", "hard"] as const,
    default: "medium" as const,
  },
} as const;

type SwarmShootSettingsType = SettingsOf<typeof swarmShootSettings>;

export const swarmShootPlugin: GamePlugin<SwarmShootState, SwarmShootAction, typeof swarmShootSettings> = {
  id: "swarm-shoot",
  title: "Swarm Shoot",
  category: "arcade",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Shoot waves of alien invaders before they reach the bottom. Survive as long as you can.",
  howToPlay: `Waves of alien invaders descend from the top of the screen. Shoot them before they reach the bottom — every enemy that gets past costs you a life. Clear the entire wave and a new, larger one begins.

Move your ship left and right using the A/D keys or the arrow keys. Aim by hovering your mouse over the play field — the ship tracks your cursor horizontally. Press Space or click to fire bullets upward. Each bullet that hits an alien destroys it and earns 10 points. Clearing an entire wave earns a 50-point bonus.

In Hard mode some aliens have two hit points and require two bullets to destroy. Watch for these tougher enemies and prioritize them, as they take more resources to clear.

Enemies that reach the bottom of the screen are removed, but cost you one life each. You start with three lives. Lose them all and the game ends. Score is the total points accumulated across all waves.

Tips: Focus on columns of enemies rather than picking off stragglers. Continuous fire is often better than aimed shots — keep tapping Space rapidly. Prioritize enemies on the sides first, as they drift toward the edges and can sneak past.`,
  settings: swarmShootSettings,
  initialState: (seed: number, settings: SwarmShootSettingsType) => initialState(seed, settings),
  reducer,
  isTerminal,
  hint: (s: any) => { const p = (s as any).phase; if (p === "gameover" || p === "done" || p === "ended" || (s as any).gameOver) return null; return { selector: '[data-testid="hint-target-swarm-shoot-action"]', pulses: 3 }; },
  component: SwarmShoot,
};
