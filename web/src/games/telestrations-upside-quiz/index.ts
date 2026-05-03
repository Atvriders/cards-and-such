import { lazy } from "react";
import type * as React from "react";
import type { GamePlugin, SettingsOf, HintTarget } from "../../platform/game-plugin/types.js";
import type { TelestrationsUpsideQuizState, TelestrationsUpsideQuizAction, TelestrationsUpsideQuizSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
const TelestrationsUpsideQuizGame = /* @__PURE__ */ lazy(() => import("./Game.js").then((mod) => ({ default: mod.TelestrationsUpsideQuizGame as unknown as React.ComponentType<unknown> })));
const settings = { dummy: { kind: "boolean" as const, label: "dummy", default: false } } as const;
type S = SettingsOf<typeof settings>;

export const telestrationsUpsideQuizPlugin: GamePlugin<TelestrationsUpsideQuizState, TelestrationsUpsideQuizAction, typeof settings> = {
  id: "telestrations-upside-quiz",
  title: "Telestrations: Upside Drawn Quiz",
  category: "cards",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Upside-Drawn variant trivia.",
  howToPlay: "Telestrations: Upside Drawn Quiz solo trivia: 10 multiple-choice questions about the game's flavor and rules. Earn 10 points per correct answer plus speed and streak bonuses.",
  settings,
  initialState: (seed: number, s: S) => initialState(seed, s as TelestrationsUpsideQuizSettings),
  reducer,
  isTerminal,
  hint: (state: TelestrationsUpsideQuizState): HintTarget | null => state.phase === "ask" ? { selector: '[data-testid="hint-target-quiz-answer-0"]', pulses: 3 } : null,
  component: TelestrationsUpsideQuizGame,
};

export default telestrationsUpsideQuizPlugin;
