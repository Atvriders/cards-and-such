import { lazy } from "react";
import type * as React from "react";
import type { GamePlugin } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { BalloonDartsState, BalloonDartsAction, BalloonDartsSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
const BalloonDarts = /* @__PURE__ */ lazy(() => import("./Game.js").then((mod) => ({ default: mod.BalloonDarts as unknown as React.ComponentType<unknown> })));
const settings = { darts: { kind:"enum" as const, label:"Darts", options:["5","10"] as const, default:"10" as const } } as const;
type S = SettingsOf<typeof settings>;
export const balloonDartsPlugin: GamePlugin<BalloonDartsState, BalloonDartsAction, typeof settings> = {
  id:"balloon-darts", title:"Balloon Darts", category:"arcade",
  players:{min:1,max:1,multiplayer:false},
  description:"Classic carnival balloon darts! Click anywhere on the board to throw — hit balloons for points.",
  howToPlay:`Balloon Darts is a carnival-style arcade game. Colorful balloons are scattered across the board. You throw darts by clicking anywhere — the dart lands exactly where you click.

Hit a balloon to pop it and earn 100 base points. Hitting near the center of a balloon earns up to 50 bonus points on top. Miss and the dart is wasted.

You start with 10 darts (or 5 on the short setting). The game ends when you run out of darts or pop all the balloons. Try to hit as many balloons as possible — ideally through their centers for maximum points.

Balloons are placed randomly each game with varying sizes. Larger balloons are easier to hit but show up less often. Aim precisely at the center of each balloon for the highest score. Can you pop all 12 balloons with just 10 darts?`,
  settings,
  initialState:(seed:number,s:S)=>initialState(seed,s as BalloonDartsSettings),
  reducer, isTerminal, 
  hint: (s: any) => { const p = (s as any)?.phase; if (p === "gameover" || p === "done" || p === "ended" || (s as any)?.gameOver === true || (s as any)?.done === true) return null; return { selector: ".arcade-wrap svg circle", pulses: 3 }; },
  component:BalloonDarts,
};
