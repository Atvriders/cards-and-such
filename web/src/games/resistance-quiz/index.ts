import type { GamePlugin, SettingsOf, HintTarget } from "../../platform/game-plugin/types.js";
import type { ResistanceQuizState, ResistanceQuizAction, ResistanceQuizSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { ResistanceQuizGame } from "./Game.js";

const settings = { dummy: { kind: "boolean" as const, label: "dummy", default: false } } as const;
type S = SettingsOf<typeof settings>;

export const resistanceQuizPlugin: GamePlugin<ResistanceQuizState, ResistanceQuizAction, typeof settings> = {
  id: "resistance-quiz",
  title: "Resistance Quiz",
  category: "cards",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Resistance trivia.",
  howToPlay: "Resistance Quiz solo trivia: 10 multiple-choice questions about the game's flavor and rules. Earn 10 points per correct answer plus speed and streak bonuses.",
  settings,
  initialState: (seed: number, s: S) => initialState(seed, s as ResistanceQuizSettings),
  reducer,
  isTerminal,
  hint: (state: ResistanceQuizState): HintTarget | null => state.phase === "ask" ? { selector: '[data-testid="hint-target-quiz-answer-0"]', pulses: 3 } : null,
  component: ResistanceQuizGame,
};

export default resistanceQuizPlugin;
