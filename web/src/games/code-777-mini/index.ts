import { lazy } from "react";
import type * as React from "react";
import type { GamePlugin, HintTarget, SettingsOf } from "../../platform/game-plugin/types.js";
import type { Code777MiniState, Code777MiniAction, Code777MiniSettings } from "./state.js";
import { Code777Mini_CFG, initialState, reducer, isTerminal } from "./state.js";
import { deductionHintSelector } from "../_shared/deduction-engine.js";
const Code777MiniGame = /* @__PURE__ */ lazy(() => import("./Game.js").then((mod) => ({ default: mod.Code777MiniGame as unknown as React.ComponentType<unknown> })));
const settings = { dummy: { kind: "boolean" as const, label: "dummy", default: false } } as const;
type S = SettingsOf<typeof settings>;

export const code777MiniPlugin: GamePlugin<Code777MiniState, Code777MiniAction, typeof settings> = {
  id: "code-777-mini",
  title: "Code 777 Mini",
  category: "board",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Logic puzzle: deduce the seven-symbol code.",
  howToPlay: "Code 777 Mini adapted as a logic-deduction puzzle: cycle each slot to set a guess, submit, and read the feedback (filled circles = exact, hollow = correct symbol but wrong slot). Crack the code in the allotted guesses to score.",
  settings,
  initialState: (seed: number, s: S) => initialState(seed, s as Code777MiniSettings),
  reducer,
  isTerminal,
  hint: (state: Code777MiniState): HintTarget | null => {
    const sel = deductionHintSelector(state, Code777Mini_CFG);
    return sel ? { selector: sel, pulses: 3 } : null;
  },
  component: Code777MiniGame,
};

export default code777MiniPlugin;
