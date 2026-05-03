import { lazy } from "react";
import type * as React from "react";
import type { GamePlugin } from "../../platform/game-plugin/types.js";
import { initialState, reducer, isTerminal, type RobotArenaState, type RobotArenaAction } from "./state.js";
const RobotArenaGame = /* @__PURE__ */ lazy(() => import("./Game.js").then((mod) => ({ default: mod.RobotArenaGame as unknown as React.ComponentType<unknown> })));
const settings = {
  arena: {
    kind: "enum" as const,
    label: "Arena Size",
    options: ["4", "5", "6"] as const,
    default: "5" as const,
  },
} as const;

export const robotArenaPlugin: GamePlugin<RobotArenaState, RobotArenaAction, typeof settings> = {
  id: "robot-arena",
  title: "Robot Arena",
  category: "board",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Control your battle robot and destroy all enemy bots on the grid before they destroy you!",
  howToPlay: `Robot Arena is a turn-based tactical combat game. You control a battle robot on a grid arena. Enemy robots patrol the arena and actively hunt you down.

Each turn you choose one action: move one space in any cardinal direction (up, down, left, right), or attack all adjacent enemies at once. Enemies then take their own turns — if an enemy is adjacent to you, it attacks and deals 1 damage; otherwise it moves one step closer.

Attack deals 2 damage to every adjacent enemy. Enemy robots have 3 HP, your robot has 5 HP. Destroy all enemies to win! If your HP drops to zero, the game ends.

Your score increases by 100 for each enemy robot destroyed. Winning earns a bonus based on remaining HP.

Strategy: control the center early to limit enemy approach angles. Attack when multiple enemies are adjacent to hit them all at once. Avoid being surrounded — move to create space when outnumbered.

Settings: choose 4×4, 5×5, or 6×6 arenas. Larger arenas have more enemies and more room to maneuver.`,
  settings,
  initialState,
  reducer,
  isTerminal,
  hint: (s: any) => { const p = (s as any).phase; if (p === "gameover" || p === "done" || p === "ended" || (s as any).gameOver || (s as any).won || (s as any).isWon || (s as any).isComplete || (s as any).complete) return null; return { selector: '[data-testid="hint-target-robot-arena-action"]', pulses: 3 }; },
  component: RobotArenaGame,
};
