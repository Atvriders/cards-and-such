import type { GamePlugin, SettingsOf, HintTarget } from "../../platform/game-plugin/types.js";
import type { FibbageXlQuizState, FibbageXlQuizAction, FibbageXlQuizSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { FibbageXlQuizGame } from "./Game.js";

const settings = { dummy: { kind: "boolean" as const, label: "dummy", default: false } } as const;
type S = SettingsOf<typeof settings>;

export const fibbageXlQuizPlugin: GamePlugin<FibbageXlQuizState, FibbageXlQuizAction, typeof settings> = {
  id: "fibbage-xl-quiz",
  title: "Fibbage XL Quiz",
  category: "cards",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Fibbage XL trivia.",
  howToPlay: "Fibbage XL Quiz solo trivia: 10 multiple-choice questions about the game's flavor and rules. Earn 10 points per correct answer plus speed and streak bonuses.",
  settings,
  initialState: (seed: number, s: S) => initialState(seed, s as FibbageXlQuizSettings),
  reducer,
  isTerminal,
  hint: (state: FibbageXlQuizState): HintTarget | null => state.phase === "ask" ? { selector: '[data-testid="hint-target-quiz-answer-0"]', pulses: 3 } : null,
  component: FibbageXlQuizGame,
};

export default fibbageXlQuizPlugin;
