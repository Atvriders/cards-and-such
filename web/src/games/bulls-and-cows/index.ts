import { lazy } from "react";
import type * as React from "react";
import type { GamePlugin, HintTarget, SettingsOf } from "../../platform/game-plugin/types.js";
import type { BullsAndCowsState, BullsAndCowsAction, BullsAndCowsSettings } from "./state.js";
import { BullsAndCows_CFG, initialState, reducer, isTerminal } from "./state.js";
import { deductionHintSelector } from "../_shared/deduction-engine.js";
const BullsAndCowsGame = /* @__PURE__ */ lazy(() => import("./Game.js").then((mod) => ({ default: mod.BullsAndCowsGame as unknown as React.ComponentType<unknown> })));
const settings = { dummy: { kind: "boolean" as const, label: "dummy", default: false } } as const;
type S = SettingsOf<typeof settings>;

export const bullsAndCowsPlugin: GamePlugin<BullsAndCowsState, BullsAndCowsAction, typeof settings> = {
  id: "bulls-and-cows",
  title: "Bulls and Cows",
  category: "board",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Numeric Mastermind: bulls = exact, cows = misplaced.",
  howToPlay: "Bulls and Cows adapted as a logic-deduction puzzle: cycle each slot to set a guess, submit, and read the feedback (filled circles = exact, hollow = correct symbol but wrong slot). Crack the code in the allotted guesses to score.",
  settings,
  initialState: (seed: number, s: S) => initialState(seed, s as BullsAndCowsSettings),
  reducer,
  isTerminal,
  hint: (state: BullsAndCowsState): HintTarget | null => {
    const sel = deductionHintSelector(state, BullsAndCows_CFG);
    return sel ? { selector: sel, pulses: 3 } : null;
  },
  component: BullsAndCowsGame,
};

export default bullsAndCowsPlugin;
