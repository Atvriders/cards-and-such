import { lazy } from "react";
import type * as React from "react";
import type { GamePlugin, HintTarget, SettingsOf } from "../../platform/game-plugin/types.js";
import type { SleuthMiniState, SleuthMiniAction, SleuthMiniSettings } from "./state.js";
import { SleuthMini_CFG, initialState, reducer, isTerminal } from "./state.js";
import { deductionHintSelector } from "../_shared/deduction-engine.js";
const SleuthMiniGame = /* @__PURE__ */ lazy(() => import("./Game.js").then((mod) => ({ default: mod.SleuthMiniGame as unknown as React.ComponentType<unknown> })));
const settings = { dummy: { kind: "boolean" as const, label: "dummy", default: false } } as const;
type S = SettingsOf<typeof settings>;

export const sleuthMiniPlugin: GamePlugin<SleuthMiniState, SleuthMiniAction, typeof settings> = {
  id: "sleuth-mini",
  title: "Sleuth Mini",
  category: "board",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Deduce hidden gem combination.",
  howToPlay: "Sleuth Mini adapted as a logic-deduction puzzle: cycle each slot to set a guess, submit, and read the feedback (filled circles = exact, hollow = correct symbol but wrong slot). Crack the code in the allotted guesses to score.",
  settings,
  initialState: (seed: number, s: S) => initialState(seed, s as SleuthMiniSettings),
  reducer,
  isTerminal,
  hint: (state: SleuthMiniState): HintTarget | null => {
    const sel = deductionHintSelector(state, SleuthMini_CFG);
    return sel ? { selector: sel, pulses: 3 } : null;
  },
  component: SleuthMiniGame,
};

export default sleuthMiniPlugin;
