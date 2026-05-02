import type { GamePlugin, SettingsOf, HintTarget } from "../../platform/game-plugin/types.js";
import type { MonikersSeriousQuizState, MonikersSeriousQuizAction, MonikersSeriousQuizSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { MonikersSeriousQuizGame } from "./Game.js";

const settings = { dummy: { kind: "boolean" as const, label: "dummy", default: false } } as const;
type S = SettingsOf<typeof settings>;

export const monikersSeriousQuizPlugin: GamePlugin<MonikersSeriousQuizState, MonikersSeriousQuizAction, typeof settings> = {
  id: "monikers-serious-quiz",
  title: "Monikers Serious Quiz",
  category: "cards",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Serious deck Monikers trivia.",
  howToPlay: "Monikers Serious Quiz solo trivia: 10 multiple-choice questions about the game's flavor and rules. Earn 10 points per correct answer plus speed and streak bonuses.",
  settings,
  initialState: (seed: number, s: S) => initialState(seed, s as MonikersSeriousQuizSettings),
  reducer,
  isTerminal,
  hint: (state: MonikersSeriousQuizState): HintTarget | null => state.phase === "ask" ? { selector: '[data-testid="hint-target-quiz-answer-0"]', pulses: 3 } : null,
  component: MonikersSeriousQuizGame,
};

export default monikersSeriousQuizPlugin;
