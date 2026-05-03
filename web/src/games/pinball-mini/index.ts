import { lazy } from "react";
import type * as React from "react";
import type { GamePlugin } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { PinballState, PinballAction } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
const PinballMini = /* @__PURE__ */ lazy(() => import("./PinballMini.js").then((mod) => ({ default: mod.PinballMini as unknown as React.ComponentType<unknown> })));
export const pinballMiniSettings = {
  bumpers: {
    kind: "enum" as const,
    label: "Bumpers",
    options: ["3", "5", "7"] as const,
    default: "5" as const,
  },
} as const;

type PinballMiniSettingsType = SettingsOf<typeof pinballMiniSettings>;

export const pinballMiniPlugin: GamePlugin<PinballState, PinballAction, typeof pinballMiniSettings> = {
  id: "pinball-mini",
  title: "Pinball Mini",
  category: "arcade",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Classic pinball — keep the ball alive and rack up bumper hits.",
  howToPlay: `Keep the glowing ball in play and smash it into bumpers to build your score. You control a paddle at the bottom of the field — move it left and right to deflect the ball back upward.

Move the paddle with the Left/Right arrow keys, the A/D keys, or by moving your mouse over the play field. Each time the ball strikes a bumper, you score 10 points and the ball accelerates slightly. Successfully bouncing the ball off the paddle scores 1 point.

You start with 3 lives. When the ball falls past the paddle, you lose one life and the ball resets to the center. Lose all three lives and the game ends.

Bumpers are arranged randomly each game, so the ball's path varies run to run. The hit counter inside each bumper tracks how many times it has been struck — try to drive the ball into the most active bumper cluster for rapid scoring.

Tip: position the paddle so the ball angles toward the densest group of bumpers rather than just returning it straight up. A slight off-center hit creates a more useful angle. Larger bumper counts create wilder, higher-scoring games.`,
  settings: pinballMiniSettings,
  initialState: (seed: number, settings: PinballMiniSettingsType) => initialState(seed, settings),
  reducer,
  isTerminal,
  hint: (s: any) => { const p = (s as any).phase; if (p === "gameover" || p === "done" || p === "ended" || (s as any).gameOver) return null; return { selector: '[data-testid="hint-target-pinball-mini-action"]', pulses: 3 }; },
  component: PinballMini,
};
