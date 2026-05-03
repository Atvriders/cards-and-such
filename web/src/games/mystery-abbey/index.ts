import { lazy } from "react";
import type * as React from "react";
import type { GamePlugin, HintTarget, SettingsOf } from "../../platform/game-plugin/types.js";
import type { MysteryAbbeyState, MysteryAbbeyAction, MysteryAbbeySettings } from "./state.js";
import { MysteryAbbey_CFG, initialState, reducer, isTerminal } from "./state.js";
import { deductionHintSelector } from "../_shared/deduction-engine.js";
const MysteryAbbeyGame = /* @__PURE__ */ lazy(() => import("./Game.js").then((mod) => ({ default: mod.MysteryAbbeyGame as unknown as React.ComponentType<unknown> })));
const settings = { dummy: { kind: "boolean" as const, label: "dummy", default: false } } as const;
type S = SettingsOf<typeof settings>;

export const mysteryAbbeyPlugin: GamePlugin<MysteryAbbeyState, MysteryAbbeyAction, typeof settings> = {
  id: "mystery-abbey",
  title: "Mystery of the Abbey",
  category: "board",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Identify the missing monk.",
  howToPlay: "Mystery of the Abbey adapted as a logic-deduction puzzle: cycle each slot to set a guess, submit, and read the feedback (filled circles = exact, hollow = correct symbol but wrong slot). Crack the code in the allotted guesses to score.",
  settings,
  initialState: (seed: number, s: S) => initialState(seed, s as MysteryAbbeySettings),
  reducer,
  isTerminal,
  hint: (state: MysteryAbbeyState): HintTarget | null => {
    const sel = deductionHintSelector(state, MysteryAbbey_CFG);
    return sel ? { selector: sel, pulses: 3 } : null;
  },
  component: MysteryAbbeyGame,
};

export default mysteryAbbeyPlugin;
