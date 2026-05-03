import { lazy } from "react";
import type * as React from "react";
import type { GamePlugin } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { CircleTrackerState, CircleTrackerAction, CircleTrackerSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
const CircleTrackerGame = /* @__PURE__ */ lazy(() => import("./Game.js").then((mod) => ({ default: mod.CircleTrackerGame as unknown as React.ComponentType<unknown> })));
const settings = { dummy: { kind:"boolean" as const, label:"dummy", default:false } } as const;
type S = SettingsOf<typeof settings>;
export const circleTrackerPlugin: GamePlugin<CircleTrackerState, CircleTrackerAction, typeof settings> = {
  id:"circle-tracker", title:"Circle Tracker", category:"arcade",
  players:{ min:1, max:1, multiplayer:false },
  description:"Tracking-attention reflex test with target circles.",
  howToPlay:"Circle Tracker is a thirty-tick attention-and-tracking reflex test. Each round (about one second per tick), the central stage shows either a TARGET circle or a BLANK background. Your job: tap when the target appears, but stay still when the screen is blank. A correct target tap scores ten points; an incorrect blank tap deducts five points (minimum zero). The timer counts down thirty ticks in the upper-right corner. This is a classic continuous-performance task used in attention research — it tests both your reaction speed and your ability to suppress impulsive taps. Average runs net 80-140 points; attentive reflex masters with disciplined inhibition score 200+ regularly. When the thirty ticks expire, your final score is locked in. Sharpen your attention, time your taps perfectly, and earn those tracking points. Stay focused — the next target could appear any tick!",
  settings,
  initialState:(seed:number,s:S)=>initialState(seed,s as CircleTrackerSettings),
  reducer,isTerminal,hint: (s: any) => { const p = (s as any).phase; if (p === "gameover" || p === "done" || p === "ended" || (s as any).gameOver) return null; return { selector: '[data-testid="hint-target-circle-tracker-action"]', pulses: 3 }; }, component:CircleTrackerGame,
};
