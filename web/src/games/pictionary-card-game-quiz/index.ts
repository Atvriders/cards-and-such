import { lazy } from "react";
import type * as React from "react";
import type { GamePlugin, SettingsOf, HintTarget } from "../../platform/game-plugin/types.js";
import type { PictionaryCardGameQuizState, PictionaryCardGameQuizAction, PictionaryCardGameQuizSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
const PictionaryCardGameQuizGame = /* @__PURE__ */ lazy(() => import("./Game.js").then((mod) => ({ default: mod.PictionaryCardGameQuizGame as unknown as React.ComponentType<unknown> })));
const settings = { dummy: { kind: "boolean" as const, label: "dummy", default: false } } as const;
type S = SettingsOf<typeof settings>;

export const pictionaryCardGameQuizPlugin: GamePlugin<PictionaryCardGameQuizState, PictionaryCardGameQuizAction, typeof settings> = {
  id: "pictionary-card-game-quiz",
  title: "Pictionary Card Game Quiz",
  category: "cards",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Card-game version trivia.",
  howToPlay: "Pictionary Card Game Quiz solo trivia: 10 multiple-choice questions about the game's flavor and rules. Earn 10 points per correct answer plus speed and streak bonuses.",
  settings,
  initialState: (seed: number, s: S) => initialState(seed, s as PictionaryCardGameQuizSettings),
  reducer,
  isTerminal,
  hint: (state: PictionaryCardGameQuizState): HintTarget | null => state.phase === "ask" ? { selector: '[data-testid="hint-target-quiz-answer-0"]', pulses: 3 } : null,
  component: PictionaryCardGameQuizGame,
};

export default pictionaryCardGameQuizPlugin;
