import { lazy } from "react";
import type * as React from "react";
import type { GamePlugin, HintTarget, SettingsOf } from "../../platform/game-plugin/types.js";
import type { AwkwardGuestsState, AwkwardGuestsAction, AwkwardGuestsSettings } from "./state.js";
import { AwkwardGuests_CFG, initialState, reducer, isTerminal } from "./state.js";
import { deductionHintSelector } from "../_shared/deduction-engine.js";
const AwkwardGuestsGame = /* @__PURE__ */ lazy(() => import("./Game.js").then((mod) => ({ default: mod.AwkwardGuestsGame as unknown as React.ComponentType<unknown> })));
const settings = { dummy: { kind: "boolean" as const, label: "dummy", default: false } } as const;
type S = SettingsOf<typeof settings>;

export const awkwardGuestsPlugin: GamePlugin<AwkwardGuestsState, AwkwardGuestsAction, typeof settings> = {
  id: "awkward-guests",
  title: "Awkward Guests",
  category: "board",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Cluedo-style detective deduction.",
  howToPlay: "Awkward Guests adapted as a logic-deduction puzzle: cycle each slot to set a guess, submit, and read the feedback (filled circles = exact, hollow = correct symbol but wrong slot). Crack the code in the allotted guesses to score.",
  settings,
  initialState: (seed: number, s: S) => initialState(seed, s as AwkwardGuestsSettings),
  reducer,
  isTerminal,
  hint: (state: AwkwardGuestsState): HintTarget | null => {
    const sel = deductionHintSelector(state, AwkwardGuests_CFG);
    return sel ? { selector: sel, pulses: 3 } : null;
  },
  component: AwkwardGuestsGame,
};

export default awkwardGuestsPlugin;
