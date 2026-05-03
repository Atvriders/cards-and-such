import { lazy } from "react";
import type * as React from "react";
import type { GamePlugin, SettingsOf, HintTarget } from "../../platform/game-plugin/types.js";
import type { ApplesToApplesQuizState, ApplesToApplesQuizAction, ApplesToApplesQuizSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
const ApplesToApplesQuizGame = /* @__PURE__ */ lazy(() => import("./Game.js").then((mod) => ({ default: mod.ApplesToApplesQuizGame as unknown as React.ComponentType<unknown> })));
const settings = { dummy: { kind: "boolean" as const, label: "dummy", default: false } } as const;
type S = SettingsOf<typeof settings>;

export const applesToApplesQuizPlugin: GamePlugin<ApplesToApplesQuizState, ApplesToApplesQuizAction, typeof settings> = {
  id: "apples-to-apples-quiz",
  title: "Apples to Apples Quiz",
  category: "cards",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Apples-to-Apples trivia.",
  howToPlay: "Apples to Apples Quiz solo trivia: 10 multiple-choice questions about the game's flavor and rules. Earn 10 points per correct answer plus speed and streak bonuses.",
  settings,
  initialState: (seed: number, s: S) => initialState(seed, s as ApplesToApplesQuizSettings),
  reducer,
  isTerminal,
  hint: (state: ApplesToApplesQuizState): HintTarget | null => state.phase === "ask" ? { selector: '[data-testid="hint-target-quiz-answer-0"]', pulses: 3 } : null,
  component: ApplesToApplesQuizGame,
};

export default applesToApplesQuizPlugin;
