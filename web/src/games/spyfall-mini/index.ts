import { lazy } from "react";
import type * as React from "react";
import type { GamePlugin, HintTarget, SettingsOf } from "../../platform/game-plugin/types.js";
import type { SpyfallMiniState, SpyfallMiniAction, SpyfallMiniSettings } from "./state.js";
import { SpyfallMini_CFG, initialState, reducer, isTerminal } from "./state.js";
import { deductionHintSelector } from "../_shared/deduction-engine.js";
const SpyfallMiniGame = /* @__PURE__ */ lazy(() => import("./Game.js").then((mod) => ({ default: mod.SpyfallMiniGame as unknown as React.ComponentType<unknown> })));
const settings = { dummy: { kind: "boolean" as const, label: "dummy", default: false } } as const;
type S = SettingsOf<typeof settings>;

export const spyfallMiniPlugin: GamePlugin<SpyfallMiniState, SpyfallMiniAction, typeof settings> = {
  id: "spyfall-mini",
  title: "Spyfall Mini",
  category: "board",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Identify the location among 8.",
  howToPlay: "Spyfall Mini adapted as a logic-deduction puzzle: cycle each slot to set a guess, submit, and read the feedback (filled circles = exact, hollow = correct symbol but wrong slot). Crack the code in the allotted guesses to score.",
  settings,
  initialState: (seed: number, s: S) => initialState(seed, s as SpyfallMiniSettings),
  reducer,
  isTerminal,
  hint: (state: SpyfallMiniState): HintTarget | null => {
    const sel = deductionHintSelector(state, SpyfallMini_CFG);
    return sel ? { selector: sel, pulses: 3 } : null;
  },
  component: SpyfallMiniGame,
};

export default spyfallMiniPlugin;
