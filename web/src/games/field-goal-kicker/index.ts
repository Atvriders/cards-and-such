import { lazy } from "react";
import type * as React from "react";
import type { GamePlugin } from "../../platform/game-plugin/types.js";
import { initialState, reducer, isTerminal, type FieldGoalState, type FieldGoalAction } from "./state.js";
const FieldGoalKicker = /* @__PURE__ */ lazy(() => import("./Game.js").then((mod) => ({ default: mod.FieldGoalKicker as unknown as React.ComponentType<unknown> })));
export const fieldGoalSettings = {
  kicks: { kind: "enum" as const, label: "Kicks", options: ["10", "15"] as const, default: "10" as const },
} as const;

export const fieldGoalPlugin: GamePlugin<FieldGoalState, FieldGoalAction, typeof fieldGoalSettings> = {
  id: "field-goal-kicker",
  title: "Field Goal Kicker",
  category: "board",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Kick 10 field goals from varying distances with wind. Nail your aim and power.",
  howToPlay: `Field Goal Kicker drops you behind the uprights for a session of 10 (or 15) attempts from distances ranging from 20 to 50 yards. Each kick has a set yardage and seeded wind condition that you must account for.

Before kicking, check the current Distance and Wind display. Wind blowing right pushes the ball right — compensate by aiming slightly left, and vice versa. Distance matters for power: the game shows the ideal power percentage for each attempt. A 20-yard chip shot needs about 35% power; a 50-yard bomb needs 95%.

Set your Aim angle (center 50% is baseline — shift opposite to the wind direction) and Power (match the suggested ideal for the current distance). Click Kick! to send the ball through the uprights.

The result shows GOOD! (split the uprights) or NO GOOD (missed left, right, or short). Each kick is logged in the history row above. After all kicks, your final score equals your conversion percentage × 10 (e.g., 8/10 = score of 800).

NFL kickers convert about 85% of field goals — can you match the pros? Short distances are easy; long kicks require near-perfect power and fine aim correction for wind.`,
  settings: fieldGoalSettings,
  initialState,
  reducer,
  isTerminal,
  hint: (s: any) => { const p = (s as any).phase; if (p === "done" || p === "gameover" || p === "ended" || p === "finished" || (s as any).gameOver || (s as any).won || (s as any).complete || (s as any).isComplete) return null; return { selector: ".fg-btn", pulses: 3 }; },
  component: FieldGoalKicker,
};
