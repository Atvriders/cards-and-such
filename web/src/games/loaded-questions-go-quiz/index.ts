import { lazy } from "react";
import type * as React from "react";
import type { GamePlugin, SettingsOf, HintTarget } from "../../platform/game-plugin/types.js";
import type { LoadedQuestionsGoQuizState, LoadedQuestionsGoQuizAction, LoadedQuestionsGoQuizSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
const LoadedQuestionsGoQuizGame = /* @__PURE__ */ lazy(() => import("./Game.js").then((mod) => ({ default: mod.LoadedQuestionsGoQuizGame as unknown as React.ComponentType<unknown> })));
const settings = { dummy: { kind: "boolean" as const, label: "dummy", default: false } } as const;
type S = SettingsOf<typeof settings>;

export const loadedQuestionsGoQuizPlugin: GamePlugin<LoadedQuestionsGoQuizState, LoadedQuestionsGoQuizAction, typeof settings> = {
  id: "loaded-questions-go-quiz",
  title: "Loaded Questions Go Quiz",
  category: "cards",
  players: { min: 1, max: 1, multiplayer: false },
  description: "LQ Go trivia.",
  howToPlay: "Loaded Questions Go Quiz solo trivia: 10 multiple-choice questions about the game's flavor and rules. Earn 10 points per correct answer plus speed and streak bonuses.",
  settings,
  initialState: (seed: number, s: S) => initialState(seed, s as LoadedQuestionsGoQuizSettings),
  reducer,
  isTerminal,
  hint: (state: LoadedQuestionsGoQuizState): HintTarget | null => state.phase === "ask" ? { selector: '[data-testid="hint-target-quiz-answer-0"]', pulses: 3 } : null,
  component: LoadedQuestionsGoQuizGame,
};

export default loadedQuestionsGoQuizPlugin;
