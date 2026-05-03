import { lazy } from "react";
import type * as React from "react";
import type { GamePlugin } from "../../platform/game-plugin/types.js";
import type { SkyJoustState, SkyJoustAction } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
const SkyJoust = /* @__PURE__ */ lazy(() => import("./SkyJoust.js").then((mod) => ({ default: mod.SkyJoust as unknown as React.ComponentType<unknown> })));
export const skyJoustPlugin: GamePlugin<SkyJoustState, SkyJoustAction, Record<never, never>> = {
  id: "joust-like",
  title: "Sky Joust",
  category: "arcade",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Flap your mount and joust flying enemies by striking them from above.",
  howToPlay: `Battle airborne enemies across a series of floating platforms by positioning yourself above them and colliding lance-first.

Tap Space or W to flap upward — each tap gives a burst of lift against gravity, so you must keep tapping to stay aloft. Use the arrow keys or A/D to move left and right. The screen wraps horizontally, so flying off the right edge brings you out the left.

Combat is height-based: if your character is higher (lower on screen) than an enemy when you collide, you defeat it. The enemy transforms into an egg on the nearest platform. Collect the egg by touching it for a bonus 500 points — if you leave it too long (5 seconds), the egg hatches back into an active enemy.

If an enemy is higher than you when you collide, you lose a life and reset to the floor. You have three lives. Clear all enemies in three waves to win. Each wave adds one more enemy.

Tips: Control your altitude precisely by varying how often you flap. Use the platforms as staging areas to launch upward attacks. Prioritize collecting eggs before they hatch. Enemies also land on platforms and change direction, so anticipate their position when attacking.`,
  settings: {} as Record<never, never>,
  initialState: (seed: number) => initialState(seed),
  reducer,
  isTerminal,
  hint: (s: any) => { const p = (s as any).phase; if (p === "gameover" || p === "done" || p === "ended" || (s as any).gameOver) return null; return { selector: '[data-testid="hint-target-joust-like-action"]', pulses: 3 }; },
  component: SkyJoust,
};
