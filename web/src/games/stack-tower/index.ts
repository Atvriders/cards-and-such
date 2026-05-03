import { lazy } from "react";
import type * as React from "react";
import type { GamePlugin } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { StackTowerState, StackTowerAction } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
const StackTower = /* @__PURE__ */ lazy(() => import("./Game.js").then((mod) => ({ default: mod.StackTower as unknown as React.ComponentType<unknown> })));
const stackTowerSettings = {
  speed: {
    kind: "enum" as const,
    label: "Speed",
    options: ["slow", "normal", "fast"] as const,
    default: "normal" as const,
  },
} as const;

type StackTowerSettingsType = SettingsOf<typeof stackTowerSettings>;

export const stackTowerPlugin: GamePlugin<StackTowerState, StackTowerAction, typeof stackTowerSettings> = {
  id: "stack-tower",
  title: "Stack Tower",
  category: "arcade",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Drop moving blocks onto your growing tower. Misalignment shrinks each layer.",
  howToPlay: `A colored block slides back and forth across the top of the tower. Press Space, click, or tap the Drop button to place it. The block will be trimmed to whatever overlaps the block below — any overhang is cut off.

The goal is to stack as many blocks as possible without losing all your width. Each level that perfectly aligns scores full points for that layer's width. Sloppy drops make the tower narrower, earning fewer points and making future drops harder. Missing entirely — dropping so the block doesn't touch the one below at all — ends the game immediately.

Score is calculated from each layer's width: a full-width perfect drop scores around 80 points, while a narrow layer scores proportionally less. As you progress, the sliding speed increases slightly, raising the challenge.

The game ends when you completely miss the stack.

Tips: Watch the rhythm of the block's movement. Try to drop at the exact moment the sliding block is over the stack. As the tower narrows, small timing errors have bigger consequences. It helps to mentally track where the center of the current layer is and aim for that rather than the edges.`,
  settings: stackTowerSettings,
  initialState: (seed: number, settings: StackTowerSettingsType) => initialState(seed, settings),
  reducer,
  isTerminal,
  hint: (s: any) => { const p = (s as any).phase; if (p === "gameover" || p === "done" || p === "ended" || (s as any).gameOver) return null; return { selector: '[data-testid="hint-target-stack-tower-action"]', pulses: 3 }; },
  component: StackTower,
};
