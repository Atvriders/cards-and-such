import { lazy } from "react";
import type * as React from "react";
import type { GamePlugin } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { LavaLeapState, LavaLeapAction, LavaLeapSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
const LavaLeap = /* @__PURE__ */ lazy(() => import("./Game.js").then((mod) => ({ default: mod.LavaLeap as unknown as React.ComponentType<unknown> })));
const lavaLeapSettings = {
  leaps: { kind: "enum" as const, label: "Leaps", options: ["5", "8"] as const, default: "5" as const },
} as const;

type LavaLeapSettingsType = SettingsOf<typeof lavaLeapSettings>;

export const lavaLeapPlugin: GamePlugin<LavaLeapState, LavaLeapAction, typeof lavaLeapSettings> = {
  id: "lava-leap",
  title: "Lava Leap",
  category: "arcade",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Charge your jump and release at the perfect power to clear the lava gap. Too little and you fall in; too much and you overshoot!",
  howToPlay: `Lava Leap is a power-timing arcade game. Each round a gap of lava lies between you and safety. A power bar fills from left to right — you need to jump with just enough power to clear it.

The orange zone on the bar marks the target range. Press JUMP when the power bar fills into the orange zone. Too little power (below the zone) and you fall into the lava for 0 points. Hitting the zone perfectly scores 100 points. A bit too much power (overshoot) scores 40 points.

Each leap has a different gap size and fill speed. Read the position of the orange zone before acting. The power bar fills at varying speeds so timing changes each round.

Use Settings to choose 5 or 8 leaps. Max score is 500 or 800 with perfect jumps on every leap.

Jump too early and you're lava toast. Jump too late and you overshoot into the next pit. Find the sweet spot and clear every gap for a perfect run!`,
  settings: lavaLeapSettings,
  initialState: (seed: number, settings: LavaLeapSettingsType) => initialState(seed, settings as LavaLeapSettings),
  reducer,
  isTerminal,
  hint: (s: any) => { const p = (s as any).phase; if (p === "gameover" || p === "done" || p === "ended" || (s as any).gameOver) return null; return { selector: '[data-testid="hint-target-lava-leap-action"]', pulses: 3 }; },
  component: LavaLeap,
};
