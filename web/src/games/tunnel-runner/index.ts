import { lazy } from "react";
import type * as React from "react";
import type { GamePlugin } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { TunnelRunnerState, TunnelRunnerAction } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
const TunnelRunner = /* @__PURE__ */ lazy(() => import("./Game.js").then((mod) => ({ default: mod.TunnelRunner as unknown as React.ComponentType<unknown> })));
const tunnelRunnerSettings = {
  difficulty: {
    kind: "enum" as const,
    label: "Difficulty",
    options: ["easy", "normal", "hard"] as const,
    default: "normal" as const,
  },
} as const;

type TunnelRunnerSettingsType = SettingsOf<typeof tunnelRunnerSettings>;

export const tunnelRunnerPlugin: GamePlugin<TunnelRunnerState, TunnelRunnerAction, typeof tunnelRunnerSettings> = {
  id: "tunnel-runner",
  title: "Tunnel Runner",
  category: "arcade",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Steer your ship through a narrowing tunnel that twists and turns at speed.",
  howToPlay: `You pilot a small craft through an endless tunnel that scrolls toward you. The tunnel curves and drifts, and it gradually narrows as you travel further. If your craft touches either wall, it's over.

Move your mouse horizontally over the play area to steer. The craft follows your cursor's x-position directly. You can also press A or the Left Arrow to nudge left and D or the Right Arrow to nudge right.

Your score is based on distance traveled. The further you go, the higher your score. Over time the scroll speed increases and the tunnel width decreases — both make surviving harder.

Difficulty affects starting width and speed: Easy starts with a wider tunnel at a gentler pace, Hard starts narrow and fast.

Tips: Don't fight the tunnel's drift — flow with it and anticipate curves before they arrive. Keep the craft near the center when the tunnel is wide, giving you reaction time for sudden turns. At higher speeds, small corrections work better than large sudden movements. The tunnel drifts smoothly so try to predict the next bend by watching where the walls are heading.`,
  settings: tunnelRunnerSettings,
  initialState: (seed: number, settings: TunnelRunnerSettingsType) => initialState(seed, settings),
  reducer,
  isTerminal,
  hint: (s: any) => { const p = (s as any)?.phase; if (p === "gameover" || p === "done" || p === "ended" || (s as any)?.gameOver === true || (s as any)?.done === true) return null; return { selector: ".tr-canvas", pulses: 3 }; },
  component: TunnelRunner,
};
