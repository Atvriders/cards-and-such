import { lazy } from "react";
import type * as React from "react";
import type { GamePlugin, HintTarget, SettingsOf } from "../../platform/game-plugin/types.js";
import type { ConceptDeductionState, ConceptDeductionAction, ConceptDeductionSettings } from "./state.js";
import { ConceptDeduction_CFG, initialState, reducer, isTerminal } from "./state.js";
import { deductionHintSelector } from "../_shared/deduction-engine.js";
const ConceptDeductionGame = /* @__PURE__ */ lazy(() => import("./Game.js").then((mod) => ({ default: mod.ConceptDeductionGame as unknown as React.ComponentType<unknown> })));
const settings = { dummy: { kind: "boolean" as const, label: "dummy", default: false } } as const;
type S = SettingsOf<typeof settings>;

export const conceptDeductionPlugin: GamePlugin<ConceptDeductionState, ConceptDeductionAction, typeof settings> = {
  id: "concept-deduction",
  title: "Concept",
  category: "board",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Deduce the concept from icons.",
  howToPlay: "Concept adapted as a logic-deduction puzzle: cycle each slot to set a guess, submit, and read the feedback (filled circles = exact, hollow = correct symbol but wrong slot). Crack the code in the allotted guesses to score.",
  settings,
  initialState: (seed: number, s: S) => initialState(seed, s as ConceptDeductionSettings),
  reducer,
  isTerminal,
  hint: (state: ConceptDeductionState): HintTarget | null => {
    const sel = deductionHintSelector(state, ConceptDeduction_CFG);
    return sel ? { selector: sel, pulses: 3 } : null;
  },
  component: ConceptDeductionGame,
};

export default conceptDeductionPlugin;
