import { lazy } from "react";
import type * as React from "react";
import type { GamePlugin, HintTarget, SettingsOf } from "../../platform/game-plugin/types.js";
import type { JottoState, JottoAction, JottoSettings } from "./state.js";
import { Jotto_CFG, initialState, reducer, isTerminal } from "./state.js";
import { deductionHintSelector } from "../_shared/deduction-engine.js";
const JottoGame = /* @__PURE__ */ lazy(() => import("./Game.js").then((mod) => ({ default: mod.JottoGame as unknown as React.ComponentType<unknown> })));
const settings = { dummy: { kind: "boolean" as const, label: "dummy", default: false } } as const;
type S = SettingsOf<typeof settings>;

export const jottoPlugin: GamePlugin<JottoState, JottoAction, typeof settings> = {
  id: "jotto",
  title: "Jotto",
  category: "board",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Five-letter unique-letter word puzzle.",
  howToPlay: "Jotto adapted as a logic-deduction puzzle: cycle each slot to set a guess, submit, and read the feedback (filled circles = exact, hollow = correct symbol but wrong slot). Crack the code in the allotted guesses to score.",
  settings,
  initialState: (seed: number, s: S) => initialState(seed, s as JottoSettings),
  reducer,
  isTerminal,
  hint: (state: JottoState): HintTarget | null => {
    const sel = deductionHintSelector(state, Jotto_CFG);
    return sel ? { selector: sel, pulses: 3 } : null;
  },
  component: JottoGame,
};

export default jottoPlugin;
