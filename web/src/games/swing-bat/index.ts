import { lazy } from "react";
import type * as React from "react";
import type { GamePlugin } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { SwingBatState, SwingBatAction, SwingBatSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
const SwingBatGame = /* @__PURE__ */ lazy(() => import("./Game.js").then((mod) => ({ default: mod.SwingBatGame as unknown as React.ComponentType<unknown> })));
const settings = { dummy: { kind:"boolean" as const, label:"dummy", default:false } } as const;
type S = SettingsOf<typeof settings>;
export const swingBatPlugin: GamePlugin<SwingBatState, SwingBatAction, typeof settings> = {
  id: "swing-bat", title: "Swing Bat", category: "arcade",
  players: { min:1, max:1, multiplayer:false },
  description: "Time your swing perfectly to connect with the ball for maximum points!",
  howToPlay: `Swing Bat challenges you to time your swing with precise accuracy. A ball is pitched toward you and you control the timing of your swing.\n\nAdjust the Timing slider to represent when in the pitch sequence you swing. Hit too early or too late and you miss. Find the sweet spot and earn up to 100 points per swing.\n\n10 swings per game. The target timing shifts slightly each round based on pitch variation. Use your results to calibrate the next swing and build up the highest cumulative score!`,
  settings,
  initialState: (seed:number, s:S) => initialState(seed, s as SwingBatSettings),
  reducer, isTerminal,
  hint: (s: any) => { const p = (s as any).phase; if (p === "gameover" || p === "done" || p === "ended" || (s as any).gameOver) return null; return { selector: '[data-testid="hint-target-swing-bat-action"]', pulses: 3 }; },
  component: SwingBatGame,
};
