import { lazy } from "react";
import type * as React from "react";
import type { GamePlugin } from "../../platform/game-plugin/types.js";
import type { SkyDefenderState, SkyDefenderAction } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
const SkyDefender = /* @__PURE__ */ lazy(() => import("./SkyDefender.js").then((mod) => ({ default: mod.SkyDefender as unknown as React.ComponentType<unknown> })));
export const skyDefenderPlugin: GamePlugin<SkyDefenderState, SkyDefenderAction, Record<never, never>> = {
  id: "defender-like",
  title: "Sky Defender",
  category: "arcade",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Pilot a ship through a scrolling world and rescue humans from alien abductors.",
  howToPlay: `Fly your ship freely through a wide scrolling environment and destroy alien craft before they abduct all the humans on the ground.

Use WASD or the arrow keys to move in any direction — hold the key for continuous movement. Press Space or the Fire button to shoot a projectile in the direction you are facing. Left and right movement also determines your facing direction, so point your ship toward enemies before firing.

Ten humans stand on the ground. Aliens dive from above to grab them. An alien carrying a human will slowly ascend; if it reaches the top of the screen the human is lost. Shoot the alien before it escapes to free the human. If all humans are lost, the mission fails even if you have lives remaining.

Clear all aliens to advance through three waves. Each wave has more aliens that move faster. Destroy all three waves to win. Score 150 per alien kill. Remaining lives grant 1000 bonus each at game end.

Tips: Scan the full screen — the world is wider than the viewport and aliens operate off-screen. Prioritize diving aliens over idle ones. If an alien carrying a human is shot, the human drops safely.`,
  settings: {} as Record<never, never>,
  initialState: (seed: number) => initialState(seed),
  reducer,
  isTerminal,
  hint: (s: any) => { const p = (s as any).phase; if (p === "gameover" || p === "done" || p === "ended" || (s as any).gameOver || (s as any).won || (s as any).isWon || (s as any).isComplete || (s as any).complete) return null; return { selector: '[data-testid="hint-target-defender-like-action"]', pulses: 3 }; },
  component: SkyDefender,
};
