import { lazy } from "react";
import type * as React from "react";
import type { GamePlugin, HintTarget, SettingsOf } from "../../platform/game-plugin/types.js";
import type { ChroniclesOfCrimeState, ChroniclesOfCrimeAction, ChroniclesOfCrimeSettings } from "./state.js";
import { ChroniclesOfCrime_CFG, initialState, reducer, isTerminal } from "./state.js";
import { deductionHintSelector } from "../_shared/deduction-engine.js";
const ChroniclesOfCrimeGame = /* @__PURE__ */ lazy(() => import("./Game.js").then((mod) => ({ default: mod.ChroniclesOfCrimeGame as unknown as React.ComponentType<unknown> })));
const settings = { dummy: { kind: "boolean" as const, label: "dummy", default: false } } as const;
type S = SettingsOf<typeof settings>;

export const chroniclesOfCrimePlugin: GamePlugin<ChroniclesOfCrimeState, ChroniclesOfCrimeAction, typeof settings> = {
  id: "chronicles-of-crime",
  title: "Chronicles of Crime",
  category: "board",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Crime-scene deduction.",
  howToPlay: "Chronicles of Crime adapted as a logic-deduction puzzle: cycle each slot to set a guess, submit, and read the feedback (filled circles = exact, hollow = correct symbol but wrong slot). Crack the code in the allotted guesses to score.",
  settings,
  initialState: (seed: number, s: S) => initialState(seed, s as ChroniclesOfCrimeSettings),
  reducer,
  isTerminal,
  hint: (state: ChroniclesOfCrimeState): HintTarget | null => {
    const sel = deductionHintSelector(state, ChroniclesOfCrime_CFG);
    return sel ? { selector: sel, pulses: 3 } : null;
  },
  component: ChroniclesOfCrimeGame,
};

export default chroniclesOfCrimePlugin;
