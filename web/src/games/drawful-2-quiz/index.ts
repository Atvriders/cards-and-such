import { lazy } from "react";
import type * as React from "react";
import type { GamePlugin, SettingsOf, HintTarget } from "../../platform/game-plugin/types.js";
import type { Drawful2QuizState, Drawful2QuizAction, Drawful2QuizSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
const Drawful2QuizGame = /* @__PURE__ */ lazy(() => import("./Game.js").then((mod) => ({ default: mod.Drawful2QuizGame as unknown as React.ComponentType<unknown> })));
const settings = { dummy: { kind: "boolean" as const, label: "dummy", default: false } } as const;
type S = SettingsOf<typeof settings>;

export const drawful2QuizPlugin: GamePlugin<Drawful2QuizState, Drawful2QuizAction, typeof settings> = {
  id: "drawful-2-quiz",
  title: "Drawful 2 Quiz",
  category: "cards",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Drawful 2 trivia.",
  howToPlay: "Drawful 2 Quiz solo trivia: 10 multiple-choice questions about the game's flavor and rules. Earn 10 points per correct answer plus speed and streak bonuses.",
  settings,
  initialState: (seed: number, s: S) => initialState(seed, s as Drawful2QuizSettings),
  reducer,
  isTerminal,
  hint: (state: Drawful2QuizState): HintTarget | null => state.phase === "ask" ? { selector: '[data-testid="hint-target-quiz-answer-0"]', pulses: 3 } : null,
  component: Drawful2QuizGame,
};

export default drawful2QuizPlugin;
