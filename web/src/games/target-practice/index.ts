import { lazy } from "react";
import type * as React from "react";
import type { GamePlugin } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { TargetPracticeState, TargetPracticeAction } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
const TargetPractice = /* @__PURE__ */ lazy(() => import("./TargetPractice.js").then((mod) => ({ default: mod.TargetPractice as unknown as React.ComponentType<unknown> })));
export const targetPracticeSettings = {
  duration: {
    kind: "enum" as const,
    label: "Duration",
    options: ["30", "60", "90"] as const,
    default: "60" as const,
  },
  difficulty: {
    kind: "enum" as const,
    label: "Difficulty",
    options: ["easy", "medium", "hard"] as const,
    default: "medium" as const,
  },
} as const;

type TargetPracticeSettingsType = SettingsOf<typeof targetPracticeSettings>;

export const targetPracticePlugin: GamePlugin<TargetPracticeState, TargetPracticeAction, typeof targetPracticeSettings> = {
  id: "target-practice",
  title: "Target Practice",
  category: "board",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Click targets before they disappear. Smaller and faster-expiring targets score more.",
  howToPlay: `Circular targets pop up on a dark arena at random positions. Click or tap each target before it fades away to score points. If you click the empty arena background instead of a target, you lose one point as a penalty.

Targets come in different sizes. Smaller targets are worth more points because they are harder to click precisely. Targets also fade as their lifetime ticks down — hitting a target near the end of its life gives a bonus since you reacted quickly despite the pressure. Each hit scores at least 1 point.

The game lasts 30, 60, or 90 seconds. Difficulty controls how fast targets spawn and how long they stay on screen. On easy, targets are large and linger for several seconds. On hard, small targets appear rapidly and disappear in just over a second, demanding fast reflexes and accurate clicking.

Your final score is the total points earned minus penalties. Clicks on empty space subtract one point each, so avoid spam-clicking.

Tips: Keep your cursor near the center of the arena to minimize the distance you have to move. Watch for new targets appearing at the edges. Don't chase targets that are almost gone — redirect your attention to fresh ones. On hard mode, develop a rhythm of scanning the whole arena rather than fixating on one area.`,
  settings: targetPracticeSettings,
  initialState: (seed: number, settings: TargetPracticeSettingsType) => initialState(seed, settings),
  reducer,
  isTerminal,
  component: TargetPractice,
};
