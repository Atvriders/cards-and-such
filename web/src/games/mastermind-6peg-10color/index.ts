import { lazy } from "react";
import type * as React from "react";
import type { GamePlugin, HintTarget, SettingsOf } from "../../platform/game-plugin/types.js";
import type { Mastermind6peg10colorState, Mastermind6peg10colorAction, Mastermind6peg10colorSettings } from "./state.js";
import { Mastermind6peg10color_CFG, initialState, reducer, isTerminal } from "./state.js";
import { deductionHintSelector } from "../_shared/deduction-engine.js";
const Mastermind6peg10colorGame = /* @__PURE__ */ lazy(() => import("./Game.js").then((mod) => ({ default: mod.Mastermind6peg10colorGame as unknown as React.ComponentType<unknown> })));
const settings = { dummy: { kind: "boolean" as const, label: "dummy", default: false } } as const;
type S = SettingsOf<typeof settings>;

export const mastermind6peg10colorPlugin: GamePlugin<Mastermind6peg10colorState, Mastermind6peg10colorAction, typeof settings> = {
  id: "mastermind-6peg-10color",
  title: "Mastermind 6/10",
  category: "board",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Hardest classic Mastermind.",
  howToPlay: "Mastermind 6/10 adapted as a logic-deduction puzzle: cycle each slot to set a guess, submit, and read the feedback (filled circles = exact, hollow = correct symbol but wrong slot). Crack the code in the allotted guesses to score.",
  settings,
  initialState: (seed: number, s: S) => initialState(seed, s as Mastermind6peg10colorSettings),
  reducer,
  isTerminal,
  hint: (state: Mastermind6peg10colorState): HintTarget | null => {
    const sel = deductionHintSelector(state, Mastermind6peg10color_CFG);
    return sel ? { selector: sel, pulses: 3 } : null;
  },
  component: Mastermind6peg10colorGame,
};

export default mastermind6peg10colorPlugin;
