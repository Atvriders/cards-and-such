import { lazy } from "react";
import type * as React from "react";
import type { GamePlugin } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { LeafRakeState, LeafRakeAction } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
const LeafRake = /* @__PURE__ */ lazy(() => import("./LeafRake.js").then((mod) => ({ default: mod.LeafRake as unknown as React.ComponentType<unknown> })));
export const leafRakeSettings = { rounds:{kind:"enum" as const,label:"Rounds",options:["5","10","15"] as const,default:"10" as const} } as const;
type S=SettingsOf<typeof leafRakeSettings>;
export const leafRakePlugin:GamePlugin<LeafRakeState,LeafRakeAction,typeof leafRakeSettings> = {
  id:"leaf-rake",title:"Leaf Rake",category:"arcade",
  players:{min:1,max:1,multiplayer:false},
  description:"Tap to rake fallen leaves into a pile and score points.",
  howToPlay:`Leaf Rake is a satisfying tap-based arcade game. Each round a pile of scattered leaves must be raked together. The target shows how many rake strokes are needed to collect them all. Tap the button repeatedly for each stroke until you reach the count. Completing the pile earns 10 points. After each round, a new pile with a different count is ready. Play 5, 10, or 15 rounds. Tips: Leaf piles range from 3 to 8 strokes. Watch the progress counter and stop exactly at the target. Fast steady tapping builds a good rhythm. Autumn leaves never rake themselves!`,
  settings:leafRakeSettings,
  initialState:(seed:number,settings:S)=>initialState(seed,settings),
  reducer,isTerminal,
  hint: (s: any) => { const p = (s as any).phase; if (p === "gameover" || p === "done" || p === "ended" || (s as any).gameOver) return null; return { selector: '[data-testid="hint-target-leaf-rake-action"]', pulses: 3 }; },
  component:LeafRake,
};
