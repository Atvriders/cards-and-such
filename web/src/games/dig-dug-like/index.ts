import { lazy } from "react";
import type * as React from "react";
import type { GamePlugin } from "../../platform/game-plugin/types.js";
import type { TunnelDigState, TunnelDigAction } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
const TunnelDig = /* @__PURE__ */ lazy(() => import("./TunnelDig.js").then((mod) => ({ default: mod.TunnelDig as unknown as React.ComponentType<unknown> })));
export const tunnelDigPlugin: GamePlugin<TunnelDigState, TunnelDigAction, Record<never, never>> = {
  id: "dig-dug-like",
  title: "Tunnel Dig",
  category: "arcade",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Dig tunnels through the earth and pump up monsters to pop them.",
  howToPlay: `Tunnel through an underground grid and eliminate all enemies by pumping them up until they pop.

Use the arrow keys or WASD to move your digger in any of four directions. Moving into an unexcavated cell automatically digs through it, leaving a tunnel behind. Enemies wander the already-dug tunnels; they cannot pass through solid ground on their own.

To defeat an enemy, face it from an adjacent cell and hold Space (or the Pump button). Each hold applies one pump charge. An enemy needs three consecutive pumps to pop — if you release the pump between pumps, the enemy slowly deflates back toward zero. Pumping is safe: partially pumped enemies are frozen in place and cannot hurt you.

Enemies start moving again after fully deflating. Each popped enemy scores 200 points. Eliminate all six enemies to win. Touching an unpumped enemy costs a life; you have three lives. Winning with extra lives earns a 500-point bonus per life.

Tips: Dig routes that connect enemy zones so you can corner them. Pump from a dead-end where enemies cannot approach from behind. Clear the fastest-moving enemies first.`,
  settings: {} as Record<never, never>,
  initialState: (seed: number) => initialState(seed),
  reducer,
  isTerminal,
  hint: (s: any) => { const p = (s as any)?.phase; if (p === "gameover" || p === "done" || p === "ended" || (s as any)?.gameOver === true || (s as any)?.done === true) return null; return { selector: ".tunneldig-cell", pulses: 3 }; },
  component: TunnelDig,
};
