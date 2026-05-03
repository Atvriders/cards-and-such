import { lazy } from "react";
import type * as React from "react";
import type { GamePlugin } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { PencilSharpenState, PencilSharpenAction } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
const PencilSharpen = /* @__PURE__ */ lazy(() => import("./PencilSharpen.js").then((mod) => ({ default: mod.PencilSharpen as unknown as React.ComponentType<unknown> })));
export const pencilSharpenSettings = { rounds:{kind:"enum" as const,label:"Rounds",options:["5","10","15"] as const,default:"10" as const} } as const;
type S=SettingsOf<typeof pencilSharpenSettings>;
export const pencilSharpenPlugin:GamePlugin<PencilSharpenState,PencilSharpenAction,typeof pencilSharpenSettings> = {
  id:"pencil-sharpen",title:"Pencil Sharpen",category:"arcade",
  players:{min:1,max:1,multiplayer:false},
  description:"Tap to sharpen pencils and score points.",
  howToPlay:`Pencil Sharpen is a quick-tap arcade game. Each round a pencil must be sharpened a target number of turns. Watch the crank counter and tap until you reach the target. Finishing a pencil earns 10 points. A new dull pencil with a fresh sharpening target arrives each round. Play 5, 10, or 15 rounds. Tips: Pencils need 3 to 8 turns depending on how dull they are. A perfectly sharpened pencil comes from stopping exactly at the target — over-sharpening breaks the tip! Count each turn carefully and maintain a steady rhythm for best results.`,
  settings:pencilSharpenSettings,
  initialState:(seed:number,settings:S)=>initialState(seed,settings),
  reducer,isTerminal,
  hint: (s: any) => { const p = (s as any).phase; if (p === "gameover" || p === "done" || p === "ended" || (s as any).gameOver) return null; return { selector: '[data-testid="hint-target-pencil-sharpen-action"]', pulses: 3 }; },
  component:PencilSharpen,
};
