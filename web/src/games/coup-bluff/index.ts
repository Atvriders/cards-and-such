import { lazy } from "react";
import type * as React from "react";
import type { GamePlugin, HintTarget, SettingsOf } from "../../platform/game-plugin/types.js";
import type { CoupBluffState, CoupBluffAction, CoupBluffSettings } from "./state.js";
import { CoupBluff_CFG, initialState, reducer, isTerminal } from "./state.js";
import { deductionHintSelector } from "../_shared/deduction-engine.js";
const CoupBluffGame = /* @__PURE__ */ lazy(() => import("./Game.js").then((mod) => ({ default: mod.CoupBluffGame as unknown as React.ComponentType<unknown> })));
const settings = { dummy: { kind: "boolean" as const, label: "dummy", default: false } } as const;
type S = SettingsOf<typeof settings>;

export const coupBluffPlugin: GamePlugin<CoupBluffState, CoupBluffAction, typeof settings> = {
  id: "coup-bluff",
  title: "Coup: Bluff Puzzle",
  category: "board",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Deduce hidden roles in Coup.",
  howToPlay: "Coup: Bluff Puzzle adapted as a logic-deduction puzzle: cycle each slot to set a guess, submit, and read the feedback (filled circles = exact, hollow = correct symbol but wrong slot). Crack the code in the allotted guesses to score.",
  settings,
  initialState: (seed: number, s: S) => initialState(seed, s as CoupBluffSettings),
  reducer,
  isTerminal,
  hint: (state: CoupBluffState): HintTarget | null => {
    const sel = deductionHintSelector(state, CoupBluff_CFG);
    return sel ? { selector: sel, pulses: 3 } : null;
  },
  component: CoupBluffGame,
};

export default coupBluffPlugin;
