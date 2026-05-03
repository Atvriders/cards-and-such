import { lazy } from "react";
import type * as React from "react";
import type { GamePlugin } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { SnowflakeSnapState, SnowflakeSnapAction, SnowflakeSnapSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
const SnowflakeSnapGame = /* @__PURE__ */ lazy(() => import("./Game.js").then((mod) => ({ default: mod.SnowflakeSnapGame as unknown as React.ComponentType<unknown> })));
const settings = { dummy: { kind: "boolean" as const, label: "dummy", default: false } } as const;
type S = SettingsOf<typeof settings>;
export const snowflakeSnapPlugin: GamePlugin<SnowflakeSnapState, SnowflakeSnapAction, typeof settings> = {
  id: "snowflake-snap", title: "Snowflake Snap", category: "arcade",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Snap snowflakes that drift through the winter air in 30 seconds.",
  howToPlay: `Snowflake Snap is a 30-second clicker arcade. Delicate snowflakes drift through the winter air in six lanes; tap them as fast as you can to snap them for 10 points each. Snowflakes linger a few ticks before melting — miss too many and your score will suffer.

The board ticks roughly every three quarters of a second, spawning fresh snowflakes in random lanes. The screen quickly fills with sparkling targets, so practice your hand-eye coordination and aim true.

There is no skill ceiling: the more snowflakes you snap in 30 seconds, the higher your score. Beginner runs land near 150-250 points; sharp tappers pushing 400+ are showing real reflex talent. The countdown clock ticks in the top right; when it hits zero, your final score is locked in.

Snap those flakes and chill the leaderboard!`,
  settings,
  initialState: (seed: number, s: S) => initialState(seed, s as SnowflakeSnapSettings),
  reducer, isTerminal, 
  hint: (state: SnowflakeSnapState) => {
    if (state.phase === "done") return null;
    if (!state.targets || state.targets.length === 0) return null;
    return { selector: ".snowflakesnap-target", pulses: 3 };
  },
  component: SnowflakeSnapGame,
};
