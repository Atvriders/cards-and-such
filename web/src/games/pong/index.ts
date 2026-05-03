import { lazy } from "react";
import type * as React from "react";
import type { GamePlugin, HintTarget } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { PongState, PongAction } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
const Pong = /* @__PURE__ */ lazy(() => import("./Pong.js").then((mod) => ({ default: mod.Pong as unknown as React.ComponentType<unknown> })));
export const pongSettings = {
  difficulty: {
    kind: "enum" as const,
    label: "Bot difficulty",
    options: ["easy", "medium", "hard"] as const,
    default: "medium" as const,
  },
  targetScore: {
    kind: "enum" as const,
    label: "Win score",
    options: ["5", "7", "11"] as const,
    default: "11" as const,
  },
} as const;

type PongSettingsType = SettingsOf<typeof pongSettings>;

export const pongPlugin: GamePlugin<PongState, PongAction, typeof pongSettings> = {
  id: "pong",
  title: "Pong",
  category: "board",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Classic two-paddle bounce. First to 11 wins.",
  howToPlay: `Control the left paddle to keep the ball in play and score against the bot on the right.

Move your paddle up and down using the W and S keys, the Arrow Up and Arrow Down keys, or by moving your mouse over the playfield. The game begins as soon as you move. The ball bounces off the top and bottom walls and off both paddles. Where the ball hits your paddle affects its angle — hitting the edge sends it at a steeper angle, giving you directional control.

A point is scored when the ball passes a paddle. First player to reach the target score (5, 7, or 11) wins. Difficulty controls how quickly the bot reacts — on easy the bot lags behind the ball, giving you time to aim for the corners; on hard it tracks almost perfectly, so you must use sharp-angle shots to win.

Score is calculated on a win only: your final score × 50 plus the margin of victory × 10. A loss scores zero. Tips: aim for the corners away from the bot paddle. On medium and hard, alternate directions to keep the bot guessing.`,
  settings: pongSettings,
  initialState: (seed: number, settings: PongSettingsType) => initialState(seed, settings),
  reducer,
  isTerminal,
  hint: (state: PongState): HintTarget | null => {
    if (state.over) return null;
    return { selector: `[data-testid="hint-target-pong-player-paddle"]`, pulses: 3 };
  },
  component: Pong,
};
