import { lazy } from "react";
import type * as React from "react";
import type { GamePlugin, SettingsOf, HintTarget } from "../../platform/game-plugin/types.js";
import type { AvalonQuizState, AvalonQuizAction, AvalonQuizSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
const AvalonQuizGame = /* @__PURE__ */ lazy(() => import("./Game.js").then((mod) => ({ default: mod.AvalonQuizGame as unknown as React.ComponentType<unknown> })));
const settings = { dummy: { kind: "boolean" as const, label: "dummy", default: false } } as const;
type S = SettingsOf<typeof settings>;

export const avalonQuizPlugin: GamePlugin<AvalonQuizState, AvalonQuizAction, typeof settings> = {
  id: "avalon-quiz",
  title: "Avalon Quiz",
  category: "cards",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Avalon trivia.",
  howToPlay: "Avalon Quiz solo trivia: 10 multiple-choice questions about the game's flavor and rules. Earn 10 points per correct answer plus speed and streak bonuses.",
  settings,
  initialState: (seed: number, s: S) => initialState(seed, s as AvalonQuizSettings),
  reducer,
  isTerminal,
  hint: (state: AvalonQuizState): HintTarget | null => state.phase === "ask" ? { selector: '[data-testid="hint-target-quiz-answer-0"]', pulses: 3 } : null,
  component: AvalonQuizGame,
};

export default avalonQuizPlugin;
