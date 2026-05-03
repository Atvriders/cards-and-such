import { lazy } from "react";
import type * as React from "react";
import type { GamePlugin, HintTarget, SettingsOf } from "../../platform/game-plugin/types.js";
import type { KakerlakenPokerState, KakerlakenPokerAction, KakerlakenPokerSettings } from "./state.js";
import { KakerlakenPoker_CFG, initialState, reducer, isTerminal } from "./state.js";
import { deductionHintSelector } from "../_shared/deduction-engine.js";
const KakerlakenPokerGame = /* @__PURE__ */ lazy(() => import("./Game.js").then((mod) => ({ default: mod.KakerlakenPokerGame as unknown as React.ComponentType<unknown> })));
const settings = { dummy: { kind: "boolean" as const, label: "dummy", default: false } } as const;
type S = SettingsOf<typeof settings>;

export const kakerlakenPokerPlugin: GamePlugin<KakerlakenPokerState, KakerlakenPokerAction, typeof settings> = {
  id: "kakerlaken-poker",
  title: "Kakerlaken Poker",
  category: "board",
  players: { min: 1, max: 1, multiplayer: false },
  description: "German Cockroach Poker.",
  howToPlay: "Kakerlaken Poker adapted as a logic-deduction puzzle: cycle each slot to set a guess, submit, and read the feedback (filled circles = exact, hollow = correct symbol but wrong slot). Crack the code in the allotted guesses to score.",
  settings,
  initialState: (seed: number, s: S) => initialState(seed, s as KakerlakenPokerSettings),
  reducer,
  isTerminal,
  hint: (state: KakerlakenPokerState): HintTarget | null => {
    const sel = deductionHintSelector(state, KakerlakenPoker_CFG);
    return sel ? { selector: sel, pulses: 3 } : null;
  },
  component: KakerlakenPokerGame,
};

export default kakerlakenPokerPlugin;
