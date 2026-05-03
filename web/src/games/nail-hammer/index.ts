import { lazy } from "react";
import type * as React from "react";
import type { GamePlugin } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { NailHammerState, NailHammerAction } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
const NailHammer = /* @__PURE__ */ lazy(() => import("./NailHammer.js").then((mod) => ({ default: mod.NailHammer as unknown as React.ComponentType<unknown> })));
export const nailHammerSettings = { rounds:{kind:"enum" as const,label:"Rounds",options:["5","10","15"] as const,default:"10" as const} } as const;
type S=SettingsOf<typeof nailHammerSettings>;
export const nailHammerPlugin:GamePlugin<NailHammerState,NailHammerAction,typeof nailHammerSettings> = {
  id:"nail-hammer",title:"Nail Hammer",category:"arcade",
  players:{min:1,max:1,multiplayer:false},
  description:"Tap to hammer nails and score points each round.",
  howToPlay:`Nail Hammer is a satisfying tapping arcade game. Each round a nail must be hammered into a board a certain number of times to drive it flush. Watch the hammer stroke counter and tap until you reach the target. Completing a nail earns 10 points. A new nail with a fresh depth target appears each round. Play 5, 10, or 15 rounds. Tips: Nails require 3 to 8 hammer strokes. Count carefully and stop exactly at the target — over-hammering is just as bad as under-hammering. Keep a steady rhythm and visualize driving the nail true and flush with each tap.`,
  settings:nailHammerSettings,
  initialState:(seed:number,settings:S)=>initialState(seed,settings),
  reducer,isTerminal,
  hint: (s: any) => { const p = (s as any).phase; if (p === "gameover" || p === "done" || p === "ended" || (s as any).gameOver) return null; return { selector: '[data-testid="hint-target-nail-hammer-action"]', pulses: 3 }; },
  component:NailHammer,
};
