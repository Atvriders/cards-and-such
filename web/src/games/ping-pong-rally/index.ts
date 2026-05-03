import { lazy } from "react";
import type * as React from "react";
import type { GamePlugin } from "../../platform/game-plugin/types.js";
import { initialState, reducer, isTerminal, type PingPongRallyState, type PingPongRallyAction } from "./state.js";
const PingPongRally = /* @__PURE__ */ lazy(() => import("./Game.js").then((mod) => ({ default: mod.PingPongRally as unknown as React.ComponentType<unknown> })));
export const pingPongRallySettings = {
  target: { kind: "enum" as const, label: "Rally target", options: ["20", "50"] as const, default: "20" as const },
} as const;

export const pingPongRallyPlugin: GamePlugin<PingPongRallyState, PingPongRallyAction, typeof pingPongRallySettings> = {
  id: "ping-pong-rally",
  title: "Ping Pong Rally",
  category: "arcade",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Keep the rally alive! Time each return to the sweet spot before the ball goes past.",
  howToPlay: `Ping Pong Rally challenges you to return a series of balls as accurately as possible. Each exchange, the ball appears at a random position on the table — shown as a pink highlighted zone on the table graphic.

Your job is to match your Return Timing slider to where the ball is. The pink zone on the table shows the sweet spot. Drag the slider to align with it and click Hit. If you land within the tolerance window, the return is clean. Miss it and the streak resets.

Streaks are the key to a high score. Each consecutive hit adds to your streak bonus. Long unbroken rallies score significantly more than the same total hits spread across multiple rally attempts.

The ball position changes randomly each exchange — sometimes it stays center, sometimes it jumps to an extreme. Read the table carefully before each swing.

Scoring combines accuracy (hits ÷ total attempts × 800) with your longest streak (each point in longest streak = 2 bonus points). A perfect 20/20 with a streak of 20 scores around 840. Aim for both consistency and length!

Professional table tennis rallies can last hundreds of exchanges at lightning speed. How many can you string together?`,
  settings: pingPongRallySettings,
  initialState,
  reducer,
  isTerminal,
  hint: (s: any) => { const p = (s as any).phase; if (p === "gameover" || p === "done" || p === "ended" || (s as any).gameOver) return null; return { selector: '[data-testid="hint-target-ping-pong-rally-action"]', pulses: 3 }; },
  component: PingPongRally,
};
