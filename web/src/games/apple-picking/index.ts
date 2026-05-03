import { lazy } from "react";
import type * as React from "react";
import type { GamePlugin, SettingsOf } from "../../platform/game-plugin/types.js";
import type { AppleState, AppleAction } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
const ApplePicking = /* @__PURE__ */ lazy(() => import("./Game.js").then((mod) => ({ default: mod.ApplePicking as unknown as React.ComponentType<unknown> })));
export const applePickingSettings = {
  goal: {
    kind: "enum" as const,
    label: "Apple Goal",
    options: ["10", "15", "20"] as const,
    default: "10" as const,
  },
} as const;

type ApplePickingSettings = SettingsOf<typeof applePickingSettings>;

export const applePickingPlugin: GamePlugin<AppleState, AppleAction, typeof applePickingSettings> = {
  id: "apple-picking",
  title: "Apple Picking",
  category: "arcade",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Pick apples from trees to fill your basket before you run out of turns!",
  howToPlay: `Apple Picking is a fun harvest game for kids. Five apple trees are displayed on screen, each holding a different number of apples. Your job is to fill your basket by clicking the trees to pick their apples.

When you click a tree, you pick ALL the apples from that tree in one go and add them to your basket. The tree then becomes empty for a moment before growing new apples for next time.

You have a limited number of turns — so choose wisely! Look at each tree and pick the one with the most apples to be efficient. Your basket fills up as a progress bar so you can see how close you are to the goal.

Your goal is to reach the target apple count (10, 15, or 20) before your turns run out. If you fill the basket in time, you win with a perfect score. If you run short, your score is based on how many apples you collected.

Try to always pick the fullest tree each turn for the best result. Good luck filling that basket!`,
  settings: applePickingSettings,
  initialState: (seed: number, settings: ApplePickingSettings) => initialState(seed, settings),
  reducer,
  isTerminal,
  hint: (s: any) => { const p = (s as any).phase; if (p === "gameover" || p === "done" || p === "ended" || (s as any).gameOver) return null; return { selector: '[data-testid="hint-target-apple-picking-action"]', pulses: 3 }; },
  component: ApplePicking,
};
