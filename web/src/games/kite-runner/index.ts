import { lazy } from "react";
import type * as React from "react";
import type { GamePlugin } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { KiteRunnerState, KiteRunnerAction } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
const KiteRunner = /* @__PURE__ */ lazy(() => import("./KiteRunner.js").then((mod) => ({ default: mod.KiteRunner as unknown as React.ComponentType<unknown> })));
export const kiteRunnerSettings = { rounds:{kind:"enum" as const,label:"Rounds",options:["5","10","15"] as const,default:"10" as const} } as const;
type S=SettingsOf<typeof kiteRunnerSettings>;
export const kiteRunnerPlugin:GamePlugin<KiteRunnerState,KiteRunnerAction,typeof kiteRunnerSettings> = {
  id:"kite-runner",title:"Kite Runner",category:"arcade",
  players:{min:1,max:1,multiplayer:false},
  description:"Tap to reel in your kite and score points each round.",
  howToPlay:`Kite Runner puts you in control of a kite on a windy day. Each round a target number of reels is set — representing how many times you must pull the string to guide your kite through a gust. Tap the button repeatedly until you reach the target. Completing a reel earns 10 points. After each round, a new target is randomly set. Play 5, 10, or 15 rounds. Tips: Count your taps — hitting the target exactly completes the round. Stay focused on the counter and keep a steady rhythm. Longer targets require more taps but earn the same base points.`,
  settings:kiteRunnerSettings,
  initialState:(seed:number,settings:S)=>initialState(seed,settings),
  reducer,isTerminal,
  hint: (s: any) => { const p = (s as any).phase; if (p === "gameover" || p === "done" || p === "ended" || (s as any).gameOver) return null; return { selector: '[data-testid="hint-target-kite-runner-action"]', pulses: 3 }; },
  component:KiteRunner,
};
