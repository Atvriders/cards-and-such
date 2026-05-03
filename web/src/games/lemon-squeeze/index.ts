import { lazy } from "react";
import type * as React from "react";
import type { GamePlugin } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { LemonSqueezeState, LemonSqueezeAction } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
const LemonSqueeze = /* @__PURE__ */ lazy(() => import("./LemonSqueeze.js").then((mod) => ({ default: mod.LemonSqueeze as unknown as React.ComponentType<unknown> })));
export const lemonSqueezeSettings = { rounds:{kind:"enum" as const,label:"Rounds",options:["5","10","15"] as const,default:"10" as const} } as const;
type S=SettingsOf<typeof lemonSqueezeSettings>;
export const lemonSqueezePlugin:GamePlugin<LemonSqueezeState,LemonSqueezeAction,typeof lemonSqueezeSettings> = {
  id:"lemon-squeeze",title:"Lemon Squeeze",category:"arcade",
  players:{min:1,max:1,multiplayer:false},
  description:"Tap to squeeze lemons and score points each round.",
  howToPlay:`Lemon Squeeze is a tapping arcade game about juicing lemons. Each round you must squeeze a lemon a certain number of times to extract all its juice. Watch the squeeze counter and tap until you hit the target. Completing a lemon earns 10 points. A new lemon with a fresh squeeze target appears next round. Play 5, 10, or 15 rounds. Tips: Lemons require 3 to 8 squeezes depending on the round. Keep an eye on the progress counter and stop at exactly the right number. Rhythmic tapping is more reliable than panicked button mashing.`,
  settings:lemonSqueezeSettings,
  initialState:(seed:number,settings:S)=>initialState(seed,settings),
  reducer,isTerminal,
  hint: (s: any) => { const p = (s as any).phase; if (p === "gameover" || p === "done" || p === "ended" || (s as any).gameOver) return null; return { selector: '[data-testid="hint-target-lemon-squeeze-action"]', pulses: 3 }; },
  component:LemonSqueeze,
};
