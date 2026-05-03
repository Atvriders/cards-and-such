import { lazy } from "react";
import type * as React from "react";
import type { GamePlugin, HintTarget, SettingsOf } from "../../platform/game-plugin/types.js";
import type { CryptidDeductionState, CryptidDeductionAction, CryptidDeductionSettings } from "./state.js";
import { CryptidDeduction_CFG, initialState, reducer, isTerminal } from "./state.js";
import { deductionHintSelector } from "../_shared/deduction-engine.js";
const CryptidDeductionGame = /* @__PURE__ */ lazy(() => import("./Game.js").then((mod) => ({ default: mod.CryptidDeductionGame as unknown as React.ComponentType<unknown> })));
const settings = { dummy: { kind: "boolean" as const, label: "dummy", default: false } } as const;
type S = SettingsOf<typeof settings>;

export const cryptidDeductionPlugin: GamePlugin<CryptidDeductionState, CryptidDeductionAction, typeof settings> = {
  id: "cryptid-deduction",
  title: "Cryptid Deduction",
  category: "board",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Cryptid logic puzzle.",
  howToPlay: "Cryptid Deduction adapted as a logic-deduction puzzle: cycle each slot to set a guess, submit, and read the feedback (filled circles = exact, hollow = correct symbol but wrong slot). Crack the code in the allotted guesses to score.",
  settings,
  initialState: (seed: number, s: S) => initialState(seed, s as CryptidDeductionSettings),
  reducer,
  isTerminal,
  hint: (state: CryptidDeductionState): HintTarget | null => {
    const sel = deductionHintSelector(state, CryptidDeduction_CFG);
    return sel ? { selector: sel, pulses: 3 } : null;
  },
  component: CryptidDeductionGame,
};

export default cryptidDeductionPlugin;
