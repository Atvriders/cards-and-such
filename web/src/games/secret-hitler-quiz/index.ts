import type { GamePlugin, SettingsOf, HintTarget } from "../../platform/game-plugin/types.js";
import type { SecretHitlerQuizState, SecretHitlerQuizAction, SecretHitlerQuizSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { SecretHitlerQuizGame } from "./Game.js";

const settings = { dummy: { kind: "boolean" as const, label: "dummy", default: false } } as const;
type S = SettingsOf<typeof settings>;

export const secretHitlerQuizPlugin: GamePlugin<SecretHitlerQuizState, SecretHitlerQuizAction, typeof settings> = {
  id: "secret-hitler-quiz",
  title: "Secret Hitler Quiz",
  category: "cards",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Secret Hitler trivia.",
  howToPlay: "Secret Hitler Quiz solo trivia: 10 multiple-choice questions about the game's flavor and rules. Earn 10 points per correct answer plus speed and streak bonuses.",
  settings,
  initialState: (seed: number, s: S) => initialState(seed, s as SecretHitlerQuizSettings),
  reducer,
  isTerminal,
  hint: (state: SecretHitlerQuizState): HintTarget | null => state.phase === "ask" ? { selector: '[data-testid="hint-target-quiz-answer-0"]', pulses: 3 } : null,
  component: SecretHitlerQuizGame,
};

export default secretHitlerQuizPlugin;
