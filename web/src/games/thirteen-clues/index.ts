import { lazy } from "react";
import type * as React from "react";
import type { GamePlugin, HintTarget, SettingsOf } from "../../platform/game-plugin/types.js";
import type { ThirteenCluesState, ThirteenCluesAction, ThirteenCluesSettings } from "./state.js";
import { ThirteenClues_CFG, initialState, reducer, isTerminal } from "./state.js";
import { deductionHintSelector } from "../_shared/deduction-engine.js";
const ThirteenCluesGame = /* @__PURE__ */ lazy(() => import("./Game.js").then((mod) => ({ default: mod.ThirteenCluesGame as unknown as React.ComponentType<unknown> })));
const settings = { dummy: { kind: "boolean" as const, label: "dummy", default: false } } as const;
type S = SettingsOf<typeof settings>;

export const thirteenCluesPlugin: GamePlugin<ThirteenCluesState, ThirteenCluesAction, typeof settings> = {
  id: "thirteen-clues",
  title: "13 Clues",
  category: "board",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Solve a murder by deducing the secret card combo.",
  howToPlay: "13 Clues adapted as a logic-deduction puzzle: cycle each slot to set a guess, submit, and read the feedback (filled circles = exact, hollow = correct symbol but wrong slot). Crack the code in the allotted guesses to score.",
  settings,
  initialState: (seed: number, s: S) => initialState(seed, s as ThirteenCluesSettings),
  reducer,
  isTerminal,
  hint: (state: ThirteenCluesState): HintTarget | null => {
    const sel = deductionHintSelector(state, ThirteenClues_CFG);
    return sel ? { selector: sel, pulses: 3 } : null;
  },
  component: ThirteenCluesGame,
};

export default thirteenCluesPlugin;
