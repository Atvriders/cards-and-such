import { lazy } from "react";
import type * as React from "react";
import type { GamePlugin } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { ShapeRecallState, ShapeRecallAction, ShapeRecallSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
const ShapeRecall = /* @__PURE__ */ lazy(() => import("./Game.js").then((mod) => ({ default: mod.ShapeRecall as unknown as React.ComponentType<unknown> })));
const settings = { rounds: { kind:"enum" as const, label:"Rounds", options:["5","10"] as const, default:"5" as const } } as const;
type S = SettingsOf<typeof settings>;
export const shapeRecallPlugin: GamePlugin<ShapeRecallState, ShapeRecallAction, typeof settings> = {
  id:"shape-recall", title:"Shape Recall", category:"board",
  players:{min:1,max:1,multiplayer:false},
  description:"Shapes flash in sequence — can you remember the order? Sequences grow with each success!",
  howToPlay:`Shape Recall tests your visual memory using shapes instead of colors or numbers. Each round a sequence of shapes flashes one at a time. Watch the order carefully, then reproduce it by clicking the shape buttons.

Six shapes are used: circle, square, triangle, star, diamond, and cross. Start with a 2-shape sequence. Get it right and it grows by one. Get it wrong and it shortens (minimum 2). Each correct recall earns 50 points per shape.

The sequence advances automatically every 0.9 seconds — pay close attention! Because shapes are visually distinct, you can mentally narrate them: "circle, star, triangle" or associate them with things to aid memory.

Use Settings to play 5 or 10 rounds. Longer sequences require deeper concentration. With practice, you can reliably recall sequences of 7-8 shapes. Can you push your visual sequence memory to the limit?`,
  settings,
  initialState:(seed:number,s:S)=>initialState(seed,s as ShapeRecallSettings),
  reducer, isTerminal,
  hint: (state: ShapeRecallState) => {
    if (state.phase === "gameover") return null;
    return { selector: ".memory-btn", pulses: 3 };
  },
  component:ShapeRecall,
};
