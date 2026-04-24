import type { GamePlugin } from "../../platform/game-plugin/types.js";
import type { TowerDefenseMiniState, TowerDefenseMiniAction } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { TowerDefenseMini } from "./Game.js";

export const towerDefenseMiniPlugin = {
  id: "tower-defense-mini",
  title: "Tower Defense Mini",
  category: "strategy",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Place towers on a 8×6 grid to stop 10 waves of enemies from reaching your base!",
  howToPlay: `Tower Defense Mini is a classic tower defense game on a compact 8×6 grid. Enemies follow a winding path toward your base — your job is to stop them with strategically placed towers.

You start with 150 gold. Between waves, spend gold on four tower types: Arrow (cheap, fast cooldown), Cannon (high damage, slower), Slow (reduces enemy speed, lowers your damage threshold), and Lightning (devastating damage but long cooldown). Click a tower type to select it, then click any green grass cell to place it. Click an existing tower during the build phase to sell it for half price.

When you're ready, click Send Wave to simulate combat. Enemies walk the path and towers auto-fire at any enemy in range. Enemies that reach the base deal 2 damage to your base's 20 HP. Each enemy you kill earns 8 gold, plus a 20 gold bonus per wave.

Strategy: Place high-damage towers at corners where the path bends. Use Slow towers to let other towers fire more shots per enemy. Save gold for Lightning on later waves. Reach wave 10 with base HP remaining for a top score!`,
  settings: {} as const,
  initialState: (seed: number) => initialState(seed),
  reducer: reducer as (state: TowerDefenseMiniState, action: TowerDefenseMiniAction) => TowerDefenseMiniState,
  isTerminal,
  component: TowerDefenseMini,
} as unknown as GamePlugin;
