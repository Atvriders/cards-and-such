import { lazy } from "react";
import type * as React from "react";
import type { GamePlugin } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { TowerOfHanoiState, TowerOfHanoiAction } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
const TowerOfHanoi = /* @__PURE__ */ lazy(() => import("./TowerOfHanoi.js").then((mod) => ({ default: mod.TowerOfHanoi as unknown as React.ComponentType<unknown> })));
export const towerOfHanoiSettings = {
  disks: {
    kind: "enum" as const,
    label: "Disks",
    options: ["3", "5", "7"] as const,
    default: "3" as const,
  },
} as const;

type TowerOfHanoiSettingsType = SettingsOf<typeof towerOfHanoiSettings>;

export const towerOfHanoiPlugin: GamePlugin<TowerOfHanoiState, TowerOfHanoiAction, typeof towerOfHanoiSettings> = {
  id: "tower-of-hanoi",
  title: "Tower of Hanoi",
  category: "board",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Move all disks to the rightmost peg. Never put a larger disk on a smaller one.",
  howToPlay: `Move all disks from the leftmost peg to the rightmost peg. You can only move one disk at a time, and you may never place a larger disk on top of a smaller one.

Click a peg to select it, then click the destination peg to move the top disk. If a move is invalid (larger onto smaller) it is cancelled and you must try again. The middle peg is your workspace — use it to temporarily park disks while you free up larger ones.

The minimum number of moves to solve the puzzle is 2^N − 1, where N is the number of disks. With 3 disks that is 7 moves; with 5 disks it is 31; with 7 disks it is 127. Your score is max(50, 1000 − moves × 10 − hints × 50). Solving in the minimum moves with no hints gives the maximum possible score.

If you get stuck, press the Hint button and the game will play one optimal move for you — but each hint costs 50 points. Try to solve it without hints first.

Tips: For 3 disks, the pattern is straightforward: move the smallest to peg 3, the middle to peg 2, then the smallest to peg 2, the largest to peg 3, and so on. For more disks, think recursively — to move N disks, first move the top N−1 disks out of the way, then move the largest disk, then rebuild.`,
  settings: towerOfHanoiSettings,
  initialState: (seed: number, settings: TowerOfHanoiSettingsType) => initialState(seed, settings),
  reducer,
  isTerminal,
  hint: (s: any) => { const p = (s as any).phase; if (p === "done" || p === "gameover" || p === "ended" || p === "finished" || (s as any).gameOver || (s as any).won || (s as any).complete || (s as any).isComplete) return null; return { selector: ".toh-hint-btn", pulses: 3 }; },
  component: TowerOfHanoi,
};
