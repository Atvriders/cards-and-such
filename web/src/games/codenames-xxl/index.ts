import { lazy } from "react";
import type * as React from "react";
import type { GamePlugin, HintTarget, SettingsOf } from "../../platform/game-plugin/types.js";
import type { CodenamesXxlState, CodenamesXxlAction, CodenamesXxlSettings } from "./state.js";
import { CodenamesXxl_CFG, initialState, reducer, isTerminal } from "./state.js";
import { deductionHintSelector } from "../_shared/deduction-engine.js";
const CodenamesXxlGame = /* @__PURE__ */ lazy(() => import("./Game.js").then((mod) => ({ default: mod.CodenamesXxlGame as unknown as React.ComponentType<unknown> })));
const settings = { dummy: { kind: "boolean" as const, label: "dummy", default: false } } as const;
type S = SettingsOf<typeof settings>;

export const codenamesXxlPlugin: GamePlugin<CodenamesXxlState, CodenamesXxlAction, typeof settings> = {
  id: "codenames-xxl",
  title: "Codenames XXL",
  category: "board",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Larger Codenames party puzzle.",
  howToPlay: "Codenames XXL adapted as a logic-deduction puzzle: cycle each slot to set a guess, submit, and read the feedback (filled circles = exact, hollow = correct symbol but wrong slot). Crack the code in the allotted guesses to score.",
  settings,
  initialState: (seed: number, s: S) => initialState(seed, s as CodenamesXxlSettings),
  reducer,
  isTerminal,
  hint: (state: CodenamesXxlState): HintTarget | null => {
    const sel = deductionHintSelector(state, CodenamesXxl_CFG);
    return sel ? { selector: sel, pulses: 3 } : null;
  },
  component: CodenamesXxlGame,
};

export default codenamesXxlPlugin;
