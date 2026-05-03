import { lazy } from "react";
import type * as React from "react";
import type { GamePlugin } from "../../platform/game-plugin/types.js";
import type { CoinCollectorState, CoinCollectorAction, CoinCollectorSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
const CoinCollector = /* @__PURE__ */ lazy(() => import("./Game.js").then((mod) => ({ default: mod.CoinCollector as unknown as React.ComponentType<unknown> })));
const settings = {
  gridSize: {
    kind: "enum" as const,
    label: "Grid Size",
    options: ["5", "7", "9"] as const,
    default: "7" as const,
  },
  turnLimit: {
    kind: "enum" as const,
    label: "Turn Limit",
    options: ["20", "30", "40"] as const,
    default: "30" as const,
  },
} as const;

export const coinCollectorPlugin: GamePlugin<CoinCollectorState, CoinCollectorAction, typeof settings> = {
  id: "coin-collector",
  title: "Coin Collector",
  category: "board",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Navigate a grid collecting coins of varying values before your turns run out.",
  howToPlay: `Coin Collector puts you on a grid dotted with coins of four denominations: copper pennies worth 1 point, silver nickels worth 5, gold dimes worth 10, and rare quarters worth 25. Your star player starts in the top-left corner.

Each turn you move one step in any of the four cardinal directions (up, down, left, right) using the on-screen arrow buttons or your keyboard arrow keys and WASD. Moving onto a cell with a coin automatically collects it and adds its value to your score. Empty cells cost a turn but give no reward.

You have a limited number of turns (20, 30, or 40 depending on settings). Plan your route carefully to sweep up the most valuable coins before time runs out. Collecting every coin on the board earns a 100-point bonus on top of your coin total.

Strategy tips: prioritize high-value quarters (25 pts) and dimes (10 pts) over pennies. Try to plan a snake-like path that covers large areas of the grid rather than backtracking. Running straight into walls wastes a turn and advances the turn counter, so always check your direction before moving.

Grid size affects difficulty: 5x5 is compact and quick, 7x7 is balanced, and 9x9 is a sprawling challenge. Combine a large grid with a short turn limit for an extreme routing puzzle.`,
  settings,
  initialState: (seed: number, s: CoinCollectorSettings) => initialState(seed, s),
  reducer,
  isTerminal,
  hint: (s: any) => { const p = (s as any).phase; if (p === "done" || p === "gameover" || p === "ended" || p === "finished" || (s as any).gameOver || (s as any).won || (s as any).complete || (s as any).isComplete) return null; return { selector: ".cc-restart-btn", pulses: 3 }; },
  component: CoinCollector,
};
