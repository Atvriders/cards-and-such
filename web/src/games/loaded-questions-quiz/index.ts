import type { GamePlugin, SettingsOf } from "../../platform/game-plugin/types.js";
import type { LoadedQuestionsQuizState, LoadedQuestionsQuizAction, LoadedQuestionsQuizSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { LoadedQuestionsQuizGame } from "./Game.js";

const settings = { dummy: { kind: "boolean" as const, label: "dummy", default: false } } as const;
type S = SettingsOf<typeof settings>;

export const loadedQuestionsQuizPlugin: GamePlugin<LoadedQuestionsQuizState, LoadedQuestionsQuizAction, typeof settings> = {
  id: "loaded-questions-quiz",
  title: "Loaded Questions Quiz",
  category: "cards",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Loaded Questions trivia.",
  howToPlay: "Loaded Questions Quiz solo trivia: 10 multiple-choice questions about the game's flavor and rules. Earn 10 points per correct answer plus speed and streak bonuses.",
  settings,
  initialState: (seed: number, s: S) => initialState(seed, s as LoadedQuestionsQuizSettings),
  reducer,
  isTerminal,
  component: LoadedQuestionsQuizGame,
};

export default loadedQuestionsQuizPlugin;
