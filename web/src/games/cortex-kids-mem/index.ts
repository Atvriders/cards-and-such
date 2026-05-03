import { lazy } from "react";
import type * as React from "react";
import type { GamePlugin, SettingsOf } from "../../platform/game-plugin/types.js";
import type { cortexKidsMemState, cortexKidsMemAction, cortexKidsMemSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
const cortexKidsMemGame = /* @__PURE__ */ lazy(() => import("./Game.js").then((mod) => ({ default: mod.cortexKidsMemGame as unknown as React.ComponentType<unknown> })));
const settings = { dummy: { kind: "boolean" as const, label: "dummy", default: false } } as const;
type S = SettingsOf<typeof settings>;
export const cortexKidsMemPlugin: GamePlugin<cortexKidsMemState, cortexKidsMemAction, typeof settings> = {
  id: "cortex-kids-mem",
  title: "Cortex Challenge: Kids",
  category: "board",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Cortex Challenge for kids — simplified visual-memory matching.",
  howToPlay: "Cortex Challenge: Kids is the children's version of the multi-type brain-teaser game, distilled here to fifteen visual-memory matching rounds. Each round shows a brain-teaser description and asks you to choose the matching answer from four options.\n\nThe pool of kid-friendly challenges includes Color Pattern Match (Spot the matching coloured tile), Shape Sequence (Identify the next shape), Number Memory (Recall a short digit string), Sound Echo (Match a familiar sound description), and several other low-cognitive-load tasks. Each correct answer scores ten points; max 150 across fifteen rounds.\n\nClick a choice, press Submit to lock, then Next to advance. There's no timer — kids read at their own pace. Strong young observers hit 130+; sharp ones nail perfect 150.\n\nThe original Cortex Challenge: Kids has tactile, visual, memory, and logic card types — this distillation samples one type at a time in a multi-choice format. Use it for early-grade brain warmup or family game-night practice.",
  settings,
  initialState: (seed: number, s: S) => initialState(seed, s as cortexKidsMemSettings),
  reducer,
  isTerminal,
  hint: (state: cortexKidsMemState) => {
    if (state.phase === "done") return null;
    return { selector: ".gmem-btn.submit, .gmem-btn.next", pulses: 3 };
  },
  component: cortexKidsMemGame,
};
