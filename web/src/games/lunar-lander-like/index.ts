import { lazy } from "react";
import type * as React from "react";
import type { GamePlugin } from "../../platform/game-plugin/types.js";
import type { LunarDescentState, LunarDescentAction } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
const LunarDescent = /* @__PURE__ */ lazy(() => import("./LunarDescent.js").then((mod) => ({ default: mod.LunarDescent as unknown as React.ComponentType<unknown> })));
export const lunarDescentPlugin: GamePlugin<LunarDescentState, LunarDescentAction, Record<never, never>> = {
  id: "lunar-lander-like",
  title: "Lunar Descent",
  category: "arcade",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Pilot a lander through lunar gravity and touch down safely on the landing pad.",
  howToPlay: `Control a spacecraft descending through lunar gravity and land it precisely on the marked landing pad before fuel runs out.

Hold Space or W to fire the main thruster and slow your descent. Rotate the ship left with A or the left arrow, and right with D or the right arrow. The ship has no automatic stabilization — it is a pure physics simulation where each input directly changes velocity and angle.

To land successfully you must touch the green landing pad with a speed below 0.18 units per second and an angle within 23 degrees of vertical. Landing too fast, at too steep a tilt, or on the rocky terrain results in a crash. After a crash or landing, press Enter or N to try again. You have three lives.

Fuel is limited to 100 units and drains at 20 units per second of thrust. Monitor the fuel bar in the header — running out of fuel leaves you drifting under gravity with no control. Conserve fuel by making small, precise bursts rather than holding thrust continuously.

Score: 500 base points for a successful landing plus 5 points per remaining fuel unit. Win the mission with a successful landing and remaining lives grant a bonus.`,
  settings: {} as Record<never, never>,
  initialState: (seed: number) => initialState(seed),
  reducer,
  isTerminal,
  hint: (s: any) => { const p = (s as any)?.phase; if (p === "gameover" || p === "done" || p === "ended" || (s as any)?.gameOver === true || (s as any)?.done === true) return null; return { selector: ".lunardescent-playfield", pulses: 3 }; },
  component: LunarDescent,
};
