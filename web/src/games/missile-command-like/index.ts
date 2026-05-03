import { lazy } from "react";
import type * as React from "react";
import type { GamePlugin, HintTarget } from "../../platform/game-plugin/types.js";
import type { MissileCommandState, MissileCommandAction, MissileCommandSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
const MissileCommand = /* @__PURE__ */ lazy(() => import("./MissileCommand.js").then((mod) => ({ default: mod.MissileCommand as unknown as React.ComponentType<unknown> })));
export const missileCommandSettings = {} as const;

export const missileCommandPlugin: GamePlugin<
  MissileCommandState,
  MissileCommandAction,
  typeof missileCommandSettings
> = {
  id: "missile-command-like",
  title: "Missile Command",
  category: "board",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Defend your six cities from incoming missiles. Click to fire explosions.",
  howToPlay: `Six cities sit along the bottom of the screen. Waves of enemy missiles streak down from the top, each aimed at one of your cities. Your job is to intercept them before they hit.

Move your crosshair by moving the mouse (or dragging on touch). Click or tap to fire an explosion at the crosshair position. The explosion grows outward for a moment — any missile streak passing through it is destroyed, scoring points. Time your shots to catch multiple streaks at once for maximum efficiency.

A streak that reaches the ground destroys the nearest living city. Lose all six cities and it's game over. Clear all six waves without losing every city to win.

Each wave adds more missiles that travel faster, so the pressure builds. Prioritize missiles aimed at cities with fewer survivors nearby. Fire early — explosions take a moment to reach full size, so lead your targets. A perfectly placed shot in the middle of a cluster can intercept several streaks at once.

Score equals 10 × wave number per streak intercepted, plus a 500-point bonus for completing all six waves. Stay calm, aim ahead of the streaks, and save your cities!`,
  settings: missileCommandSettings,
  initialState: (seed: number, settings: MissileCommandSettings) =>
    initialState(seed, settings),
  reducer,
  isTerminal,
  hint: (): HintTarget | null => (typeof document !== "undefined" && document.querySelector(".mc-game")) ? { selector: ".mc-game", pulses: 3 } : null,
  component: MissileCommand,
};
