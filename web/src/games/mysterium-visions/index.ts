import { lazy } from "react";
import type * as React from "react";
import type { GamePlugin, HintTarget, SettingsOf } from "../../platform/game-plugin/types.js";
import type { MysteriumVisionsState, MysteriumVisionsAction, MysteriumVisionsSettings } from "./state.js";
import { MysteriumVisions_CFG, initialState, reducer, isTerminal } from "./state.js";
import { deductionHintSelector } from "../_shared/deduction-engine.js";
const MysteriumVisionsGame = /* @__PURE__ */ lazy(() => import("./Game.js").then((mod) => ({ default: mod.MysteriumVisionsGame as unknown as React.ComponentType<unknown> })));
const settings = { dummy: { kind: "boolean" as const, label: "dummy", default: false } } as const;
type S = SettingsOf<typeof settings>;

export const mysteriumVisionsPlugin: GamePlugin<MysteriumVisionsState, MysteriumVisionsAction, typeof settings> = {
  id: "mysterium-visions",
  title: "Mysterium Visions",
  category: "board",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Decipher ghost visions to identify the killer.",
  howToPlay: "Mysterium Visions adapted as a logic-deduction puzzle: cycle each slot to set a guess, submit, and read the feedback (filled circles = exact, hollow = correct symbol but wrong slot). Crack the code in the allotted guesses to score.",
  settings,
  initialState: (seed: number, s: S) => initialState(seed, s as MysteriumVisionsSettings),
  reducer,
  isTerminal,
  hint: (state: MysteriumVisionsState): HintTarget | null => {
    const sel = deductionHintSelector(state, MysteriumVisions_CFG);
    return sel ? { selector: sel, pulses: 3 } : null;
  },
  component: MysteriumVisionsGame,
};

export default mysteriumVisionsPlugin;
