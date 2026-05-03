import { lazy } from "react";
import type * as React from "react";
import type { GamePlugin, SettingsOf, HintTarget } from "../../platform/game-plugin/types.js";
import type { JackboxPack7QuizState, JackboxPack7QuizAction, JackboxPack7QuizSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
const JackboxPack7QuizGame = /* @__PURE__ */ lazy(() => import("./Game.js").then((mod) => ({ default: mod.JackboxPack7QuizGame as unknown as React.ComponentType<unknown> })));
const settings = { dummy: { kind: "boolean" as const, label: "dummy", default: false } } as const;
type S = SettingsOf<typeof settings>;

export const jackboxPack7QuizPlugin: GamePlugin<JackboxPack7QuizState, JackboxPack7QuizAction, typeof settings> = {
  id: "jackbox-pack-7-quiz",
  title: "Jackbox Pack 7 Quiz",
  category: "cards",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Pack 7 trivia.",
  howToPlay: "Jackbox Pack 7 Quiz solo trivia: 10 multiple-choice questions about the game's flavor and rules. Earn 10 points per correct answer plus speed and streak bonuses.",
  settings,
  initialState: (seed: number, s: S) => initialState(seed, s as JackboxPack7QuizSettings),
  reducer,
  isTerminal,
  hint: (state: JackboxPack7QuizState): HintTarget | null => state.phase === "ask" ? { selector: '[data-testid="hint-target-quiz-answer-0"]', pulses: 3 } : null,
  component: JackboxPack7QuizGame,
};

export default jackboxPack7QuizPlugin;
