import { lazy } from "react";
import type * as React from "react";
import type { GamePlugin } from "../../platform/game-plugin/types.js";
import type { SpeedTestState, SpeedTestAction } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
const SpeedTestGame = /* @__PURE__ */ lazy(() => import("./Game.js").then((mod) => ({ default: mod.SpeedTestGame as unknown as React.ComponentType<unknown> })));
export const speedTestMiniSettings = {} as const;

export const speedTestMiniPlugin: GamePlugin<
  SpeedTestState,
  SpeedTestAction,
  typeof speedTestMiniSettings
> = {
  id: "speed-test-mini",
  title: "Reaction Speed Test",
  category: "arcade",
  players: { min: 1, max: 1, multiplayer: false },
  description:
    "A green target appears at a random spot — click it as fast as you can. Measures your reaction time over 10 trials.",
  howToPlay: `Wait for the green circle to appear inside the arena. As soon as you see it, click it. The game records how many milliseconds passed between the target appearing and your click.

You play 10 trials. Between trials, the screen turns blue while you wait — the next target appears after a random short delay. After all 10 trials, your average reaction time is shown along with your overall score.

Your fastest average is saved locally on this device, so you can try to beat your personal best on later runs.

Tips: Keep your finger ready on the mouse button or trackpad. Don't try to predict when the target will appear — wait for it. Average human reaction times to a visual stimulus tend to be around 200–300 ms; consistently faster than that is excellent.`,
  settings: speedTestMiniSettings,
  initialState: (seed: number) => initialState(seed),
  reducer,
  isTerminal,
  hint: (s: any) => { const p = (s as any)?.phase; if (p === "gameover" || p === "done" || p === "ended" || (s as any)?.gameOver === true || (s as any)?.done === true) return null; return { selector: ".speed-test-target", pulses: 3 }; },
  component: SpeedTestGame,
};
