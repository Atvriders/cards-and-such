import { lazy } from "react";
import type * as React from "react";
import type { GamePlugin } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { TimeTrialState, TimeTrialAction } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
const TimeTrialGame = /* @__PURE__ */ lazy(() => import("./Game.js").then((mod) => ({ default: mod.TimeTrialGame as unknown as React.ComponentType<unknown> })));
export const timeTrialSettings = {
  gates: {
    kind: "enum" as const,
    label: "Gates",
    options: ["5", "8"] as const,
    default: "5" as const,
  },
} as const;

type TimeTrialSettingsType = SettingsOf<typeof timeTrialSettings>;

export const timeTrialPlugin: GamePlugin<TimeTrialState, TimeTrialAction, typeof timeTrialSettings> = {
  id: "time-trial",
  title: "Time Trial",
  category: "arcade",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Steer your car through a series of gates, scoring points for precision alignment.",
  howToPlay: `Time Trial is a precision arcade game where you guide your car through a series of timing gates as accurately as possible.

The track has 10 lanes (numbered 1 to 10). Each gate appears at a random lane. Your car starts in the middle. Before passing each gate, use the Left and Right buttons to position your car. When you are aligned with the gate, press Pass Gate to drive through.

Your score depends on precision. A perfect pass (same lane as the gate) earns 100 points. One lane off earns 60. Two lanes off earns 30. Three or more lanes off is a miss — you get zero points and receive a penalty.

After all gates are complete, penalties are calculated. Each penalty deducts 50 points from your final score. The final score is capped between 0 and 1000.

Choose 5 or 8 gates per run. With 8 gates and all perfect passes you can score 800 points before bonuses — penalties can push you below that, so aim for tight alignment every gate.

Strategy: look at the gate position indicator before moving. Count how many taps you need and move deliberately. Missing by 1 is much better than missing by 3 — you still earn 60 points vs a penalty.`,
  settings: timeTrialSettings,
  initialState: (seed: number, settings: TimeTrialSettingsType) => initialState(seed, settings),
  reducer,
  isTerminal,
  hint: (s: any) => { const p = (s as any).phase; if (p === "gameover" || p === "done" || p === "ended" || (s as any).gameOver) return null; return { selector: '[data-testid="hint-target-time-trial-action"]', pulses: 3 }; },
  component: TimeTrialGame,
};
