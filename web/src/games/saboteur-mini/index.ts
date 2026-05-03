import { lazy } from "react";
import type * as React from "react";
import type { GamePlugin, HintTarget, SettingsOf } from "../../platform/game-plugin/types.js";
import type { SaboteurMiniState, SaboteurMiniAction, SaboteurMiniSettings } from "./state.js";
import { SaboteurMini_CFG, initialState, reducer, isTerminal } from "./state.js";
import { deductionHintSelector } from "../_shared/deduction-engine.js";
const SaboteurMiniGame = /* @__PURE__ */ lazy(() => import("./Game.js").then((mod) => ({ default: mod.SaboteurMiniGame as unknown as React.ComponentType<unknown> })));
const settings = { dummy: { kind: "boolean" as const, label: "dummy", default: false } } as const;
type S = SettingsOf<typeof settings>;

export const saboteurMiniPlugin: GamePlugin<SaboteurMiniState, SaboteurMiniAction, typeof settings> = {
  id: "saboteur-mini",
  title: "Saboteur Mini",
  category: "board",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Find the saboteur miner.",
  howToPlay: "Saboteur Mini adapted as a logic-deduction puzzle: cycle each slot to set a guess, submit, and read the feedback (filled circles = exact, hollow = correct symbol but wrong slot). Crack the code in the allotted guesses to score.",
  settings,
  initialState: (seed: number, s: S) => initialState(seed, s as SaboteurMiniSettings),
  reducer,
  isTerminal,
  hint: (state: SaboteurMiniState): HintTarget | null => {
    const sel = deductionHintSelector(state, SaboteurMini_CFG);
    return sel ? { selector: sel, pulses: 3 } : null;
  },
  component: SaboteurMiniGame,
};

export default saboteurMiniPlugin;
