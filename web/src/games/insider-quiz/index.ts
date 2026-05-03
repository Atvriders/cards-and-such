import { lazy } from "react";
import type * as React from "react";
import type { GamePlugin, HintTarget, SettingsOf } from "../../platform/game-plugin/types.js";
import type { InsiderQuizState, InsiderQuizAction, InsiderQuizSettings } from "./state.js";
import { InsiderQuiz_CFG, initialState, reducer, isTerminal } from "./state.js";
import { deductionHintSelector } from "../_shared/deduction-engine.js";
const InsiderQuizGame = /* @__PURE__ */ lazy(() => import("./Game.js").then((mod) => ({ default: mod.InsiderQuizGame as unknown as React.ComponentType<unknown> })));
const settings = { dummy: { kind: "boolean" as const, label: "dummy", default: false } } as const;
type S = SettingsOf<typeof settings>;

export const insiderQuizPlugin: GamePlugin<InsiderQuizState, InsiderQuizAction, typeof settings> = {
  id: "insider-quiz",
  title: "Insider",
  category: "board",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Detect the insider.",
  howToPlay: "Insider adapted as a logic-deduction puzzle: cycle each slot to set a guess, submit, and read the feedback (filled circles = exact, hollow = correct symbol but wrong slot). Crack the code in the allotted guesses to score.",
  settings,
  initialState: (seed: number, s: S) => initialState(seed, s as InsiderQuizSettings),
  reducer,
  isTerminal,
  hint: (state: InsiderQuizState): HintTarget | null => {
    const sel = deductionHintSelector(state, InsiderQuiz_CFG);
    return sel ? { selector: sel, pulses: 3 } : null;
  },
  component: InsiderQuizGame,
};

export default insiderQuizPlugin;
