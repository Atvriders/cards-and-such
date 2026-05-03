import { lazy } from "react";
import type * as React from "react";
import type { GamePlugin, SettingsOf, HintTarget } from "../../platform/game-plugin/types.js";
import type { ApplesToApplesKidsQuizState, ApplesToApplesKidsQuizAction, ApplesToApplesKidsQuizSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
const ApplesToApplesKidsQuizGame = /* @__PURE__ */ lazy(() => import("./Game.js").then((mod) => ({ default: mod.ApplesToApplesKidsQuizGame as unknown as React.ComponentType<unknown> })));
const settings = { dummy: { kind: "boolean" as const, label: "dummy", default: false } } as const;
type S = SettingsOf<typeof settings>;

export const applesToApplesKidsQuizPlugin: GamePlugin<ApplesToApplesKidsQuizState, ApplesToApplesKidsQuizAction, typeof settings> = {
  id: "apples-to-apples-kids-quiz",
  title: "Apples to Apples Kids Quiz",
  category: "cards",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Junior edition trivia.",
  howToPlay: "Apples to Apples Kids Quiz solo trivia: 10 multiple-choice questions about the game's flavor and rules. Earn 10 points per correct answer plus speed and streak bonuses.",
  settings,
  initialState: (seed: number, s: S) => initialState(seed, s as ApplesToApplesKidsQuizSettings),
  reducer,
  isTerminal,
  hint: (state: ApplesToApplesKidsQuizState): HintTarget | null => state.phase === "ask" ? { selector: '[data-testid="hint-target-quiz-answer-0"]', pulses: 3 } : null,
  component: ApplesToApplesKidsQuizGame,
};

export default applesToApplesKidsQuizPlugin;
