import { lazy } from "react";
import type * as React from "react";
import type { GamePlugin, SettingsOf, HintTarget } from "../../platform/game-plugin/types.js";
import type { DixitQuizState, DixitQuizAction, DixitQuizSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
const DixitQuizGame = /* @__PURE__ */ lazy(() => import("./Game.js").then((mod) => ({ default: mod.DixitQuizGame as unknown as React.ComponentType<unknown> })));
const settings = { dummy: { kind: "boolean" as const, label: "dummy", default: false } } as const;
type S = SettingsOf<typeof settings>;

export const dixitQuizPlugin: GamePlugin<DixitQuizState, DixitQuizAction, typeof settings> = {
  id: "dixit-quiz",
  title: "Dixit Quiz",
  category: "cards",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Dixit storytelling trivia.",
  howToPlay: "Dixit Quiz solo trivia: 10 multiple-choice questions about the game's flavor and rules. Earn 10 points per correct answer plus speed and streak bonuses.",
  settings,
  initialState: (seed: number, s: S) => initialState(seed, s as DixitQuizSettings),
  reducer,
  isTerminal,
  hint: (state: DixitQuizState): HintTarget | null => state.phase === "ask" ? { selector: '[data-testid="hint-target-quiz-answer-0"]', pulses: 3 } : null,
  component: DixitQuizGame,
};

export default dixitQuizPlugin;
