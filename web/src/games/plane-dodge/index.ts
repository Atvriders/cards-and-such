import { lazy } from "react";
import type * as React from "react";
import type { GamePlugin } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { PlaneDodgeState, PlaneDodgeAction } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
const PlaneDodge = /* @__PURE__ */ lazy(() => import("./Game.js").then((mod) => ({ default: mod.PlaneDodge as unknown as React.ComponentType<unknown> })));
const planeDodgeSettings = {
  difficulty: {
    kind: "enum" as const,
    label: "Difficulty",
    options: ["easy", "normal", "hard"] as const,
    default: "normal" as const,
  },
} as const;

type PlaneDodgeSettingsType = SettingsOf<typeof planeDodgeSettings>;

export const planeDodgePlugin: GamePlugin<PlaneDodgeState, PlaneDodgeAction, typeof planeDodgeSettings> = {
  id: "plane-dodge",
  title: "Plane Dodge",
  category: "arcade",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Pilot a plane through an endless stream of obstacles without crashing.",
  howToPlay: `You pilot a small plane flying from left to right. Red obstacles scroll in from the right. Move your mouse over the play area to control the plane's position — the plane follows your cursor. Alternatively, use the Arrow Keys to nudge the plane up, down, left, or right.

Obstacles come in two types: full barriers with a gap you must thread through, and smaller scattered blocks you can dodge around. As you fly further, the scroll speed gradually increases, making obstacles come faster.

Your score is based on distance flown. The longer you survive, the higher your score. There are no lives — one collision ends the game immediately.

Difficulty controls starting speed: Easy gives you time to react, Normal is a brisk challenge, and Hard starts fast and escalates quickly.

Tips: Keep the plane near the vertical center of the screen to give yourself the most flexibility. When you see a full-barrier obstacle with a gap, commit to your path early rather than waiting until it's close. For scattered blocks, small smooth movements are safer than sudden jerks. Learn the obstacle rhythm — there is always a short breathing space after a dense cluster.`,
  settings: planeDodgeSettings,
  initialState: (seed: number, settings: PlaneDodgeSettingsType) => initialState(seed, settings),
  reducer,
  isTerminal,
  hint: (s: any) => { const p = (s as any)?.phase; if (p === "gameover" || p === "done" || p === "ended" || (s as any)?.gameOver === true || (s as any)?.done === true) return null; return { selector: ".pd-plane", pulses: 3 }; },
  component: PlaneDodge,
};
