import { lazy } from "react";
import type * as React from "react";
import type { GamePlugin, SettingsOf, HintTarget } from "../../platform/game-plugin/types.js";
import type { PictionaryManiaQuizState, PictionaryManiaQuizAction, PictionaryManiaQuizSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
const PictionaryManiaQuizGame = /* @__PURE__ */ lazy(() => import("./Game.js").then((mod) => ({ default: mod.PictionaryManiaQuizGame as unknown as React.ComponentType<unknown> })));
const settings = { dummy: { kind: "boolean" as const, label: "dummy", default: false } } as const;
type S = SettingsOf<typeof settings>;

export const pictionaryManiaQuizPlugin: GamePlugin<PictionaryManiaQuizState, PictionaryManiaQuizAction, typeof settings> = {
  id: "pictionary-mania-quiz",
  title: "Pictionary Mania Quiz",
  category: "cards",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Mania variant trivia.",
  howToPlay: "Pictionary Mania Quiz solo trivia: 10 multiple-choice questions about the game's flavor and rules. Earn 10 points per correct answer plus speed and streak bonuses.",
  settings,
  initialState: (seed: number, s: S) => initialState(seed, s as PictionaryManiaQuizSettings),
  reducer,
  isTerminal,
  hint: (state: PictionaryManiaQuizState): HintTarget | null => state.phase === "ask" ? { selector: '[data-testid="hint-target-quiz-answer-0"]', pulses: 3 } : null,
  component: PictionaryManiaQuizGame,
};

export default pictionaryManiaQuizPlugin;
