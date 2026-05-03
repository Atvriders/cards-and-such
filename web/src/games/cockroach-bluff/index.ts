import { lazy } from "react";
import type * as React from "react";
import type { GamePlugin, HintTarget, SettingsOf } from "../../platform/game-plugin/types.js";
import type { CockroachBluffState, CockroachBluffAction, CockroachBluffSettings } from "./state.js";
import { CockroachBluff_CFG, initialState, reducer, isTerminal } from "./state.js";
import { deductionHintSelector } from "../_shared/deduction-engine.js";
const CockroachBluffGame = /* @__PURE__ */ lazy(() => import("./Game.js").then((mod) => ({ default: mod.CockroachBluffGame as unknown as React.ComponentType<unknown> })));
const settings = { dummy: { kind: "boolean" as const, label: "dummy", default: false } } as const;
type S = SettingsOf<typeof settings>;

export const cockroachBluffPlugin: GamePlugin<CockroachBluffState, CockroachBluffAction, typeof settings> = {
  id: "cockroach-bluff",
  title: "Cockroach Poker",
  category: "board",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Cockroach Poker deduction.",
  howToPlay: "Cockroach Poker adapted as a logic-deduction puzzle: cycle each slot to set a guess, submit, and read the feedback (filled circles = exact, hollow = correct symbol but wrong slot). Crack the code in the allotted guesses to score.",
  settings,
  initialState: (seed: number, s: S) => initialState(seed, s as CockroachBluffSettings),
  reducer,
  isTerminal,
  hint: (state: CockroachBluffState): HintTarget | null => {
    const sel = deductionHintSelector(state, CockroachBluff_CFG);
    return sel ? { selector: sel, pulses: 3 } : null;
  },
  component: CockroachBluffGame,
};

export default cockroachBluffPlugin;
