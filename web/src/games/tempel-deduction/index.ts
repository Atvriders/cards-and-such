import { lazy } from "react";
import type * as React from "react";
import type { GamePlugin, HintTarget, SettingsOf } from "../../platform/game-plugin/types.js";
import type { TempelDeductionState, TempelDeductionAction, TempelDeductionSettings } from "./state.js";
import { TempelDeduction_CFG, initialState, reducer, isTerminal } from "./state.js";
import { deductionHintSelector } from "../_shared/deduction-engine.js";
const TempelDeductionGame = /* @__PURE__ */ lazy(() => import("./Game.js").then((mod) => ({ default: mod.TempelDeductionGame as unknown as React.ComponentType<unknown> })));
const settings = { dummy: { kind: "boolean" as const, label: "dummy", default: false } } as const;
type S = SettingsOf<typeof settings>;

export const tempelDeductionPlugin: GamePlugin<TempelDeductionState, TempelDeductionAction, typeof settings> = {
  id: "tempel-deduction",
  title: "Tempel",
  category: "board",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Find the temple's hidden treasures.",
  howToPlay: "Tempel adapted as a logic-deduction puzzle: cycle each slot to set a guess, submit, and read the feedback (filled circles = exact, hollow = correct symbol but wrong slot). Crack the code in the allotted guesses to score.",
  settings,
  initialState: (seed: number, s: S) => initialState(seed, s as TempelDeductionSettings),
  reducer,
  isTerminal,
  hint: (state: TempelDeductionState): HintTarget | null => {
    const sel = deductionHintSelector(state, TempelDeduction_CFG);
    return sel ? { selector: sel, pulses: 3 } : null;
  },
  component: TempelDeductionGame,
};

export default tempelDeductionPlugin;
