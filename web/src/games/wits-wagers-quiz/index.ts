import { lazy } from "react";
import type * as React from "react";
import type { GamePlugin, SettingsOf, HintTarget } from "../../platform/game-plugin/types.js";
import type { WitsWagersQuizState, WitsWagersQuizAction, WitsWagersQuizSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
const WitsWagersQuizGame = /* @__PURE__ */ lazy(() => import("./Game.js").then((mod) => ({ default: mod.WitsWagersQuizGame as unknown as React.ComponentType<unknown> })));
const settings = { dummy: { kind: "boolean" as const, label: "dummy", default: false } } as const;
type S = SettingsOf<typeof settings>;

export const witsWagersQuizPlugin: GamePlugin<WitsWagersQuizState, WitsWagersQuizAction, typeof settings> = {
  id: "wits-wagers-quiz",
  title: "Wits & Wagers Quiz",
  category: "cards",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Wits & Wagers trivia.",
  howToPlay: "Wits & Wagers Quiz solo trivia: 10 multiple-choice questions about the game's flavor and rules. Earn 10 points per correct answer plus speed and streak bonuses.",
  settings,
  initialState: (seed: number, s: S) => initialState(seed, s as WitsWagersQuizSettings),
  reducer,
  isTerminal,
  hint: (state: WitsWagersQuizState): HintTarget | null => state.phase === "ask" ? { selector: '[data-testid="hint-target-quiz-answer-0"]', pulses: 3 } : null,
  component: WitsWagersQuizGame,
};

export default witsWagersQuizPlugin;
