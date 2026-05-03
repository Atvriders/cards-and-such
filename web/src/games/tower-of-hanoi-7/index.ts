import { lazy } from "react";
import type * as React from "react";
import type { GamePlugin } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { TowerOfHanoi7State, TowerOfHanoi7Action } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
const TowerOfHanoi7 = /* @__PURE__ */ lazy(() => import("./TowerOfHanoi7.js").then((mod) => ({ default: mod.TowerOfHanoi7 as unknown as React.ComponentType<unknown> })));
export const towerOfHanoi7Settings = {
  showHints: {
    kind: "enum" as const,
    label: "Show Hints",
    options: ["yes", "no"] as const,
    default: "no",
  },
} as const;

type TowerOfHanoi7SettingsType = SettingsOf<typeof towerOfHanoi7Settings>;

export const towerOfHanoi7Plugin: GamePlugin<TowerOfHanoi7State, TowerOfHanoi7Action, typeof towerOfHanoi7Settings> = {
  id: "tower-of-hanoi-7",
  title: "Tower of Hanoi 7-Disk",
  category: "board",
  players: { min: 1, max: 1, multiplayer: false },
  description: "The classic Tower of Hanoi at maximum difficulty: 7 disks, 127 optimal moves.",
  howToPlay: `Tower of Hanoi 7-Disk is the ultimate challenge of the classic peg puzzle. You have three pegs and seven disks of different sizes stacked in order on the leftmost peg, with the largest on the bottom. Your task is to move the entire stack to the rightmost peg.

Rules: you may only move one disk at a time, always from the top of a peg. A larger disk may never be placed on top of a smaller disk. There are no other restrictions.

Click a peg to select it (highlighted in gold), then click the destination peg to move the top disk there. Click the same peg again to cancel a selection.

The minimum number of moves to solve 7 disks is 127 (equal to 2^7 - 1). You score 100 for a perfect solution and lose 1 point per extra move, with a floor of 10.

The optimal strategy follows a recursive pattern: to move n disks to the right peg, move n-1 disks to the middle, move the largest disk to the right, then move n-1 disks from the middle to the right. Odd-numbered moves always involve the smallest disk; even-numbered moves involve the only legal move not touching the smallest disk.`,
  settings: towerOfHanoi7Settings,
  initialState: (seed: number, settings: TowerOfHanoi7SettingsType) => initialState(seed, settings),
  reducer,
  isTerminal,
  hint: (s: any) => { const p = (s as any).phase; if (p === "gameover" || p === "done" || p === "ended" || (s as any).gameOver || (s as any).won || (s as any).isWon || (s as any).isComplete || (s as any).complete) return null; return { selector: '[data-testid="hint-target-tower-of-hanoi-7-action"]', pulses: 3 }; },
  component: TowerOfHanoi7,
};
