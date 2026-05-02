import type { GamePlugin, SettingsOf, HintTarget } from "../../platform/game-plugin/types.js";
import type { FibbageQuizState, FibbageQuizAction, FibbageQuizSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { FibbageQuizGame } from "./Game.js";

const settings = { dummy: { kind: "boolean" as const, label: "dummy", default: false } } as const;
type S = SettingsOf<typeof settings>;

export const fibbageQuizPlugin: GamePlugin<FibbageQuizState, FibbageQuizAction, typeof settings> = {
  id: "fibbage-quiz",
  title: "Fibbage Quiz",
  category: "cards",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Lie-writing party trivia.",
  howToPlay: "Fibbage Quiz solo trivia: 10 multiple-choice questions about the game's flavor and rules. Earn 10 points per correct answer plus speed and streak bonuses.",
  settings,
  initialState: (seed: number, s: S) => initialState(seed, s as FibbageQuizSettings),
  reducer,
  isTerminal,
  hint: (state: FibbageQuizState): HintTarget | null => state.phase === "ask" ? { selector: '[data-testid="hint-target-quiz-answer-0"]', pulses: 3 } : null,
  component: FibbageQuizGame,
};

export default fibbageQuizPlugin;
