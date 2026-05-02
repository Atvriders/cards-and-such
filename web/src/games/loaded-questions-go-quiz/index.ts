import type { GamePlugin, SettingsOf } from "../../platform/game-plugin/types.js";
import type { LoadedQuestionsGoQuizState, LoadedQuestionsGoQuizAction, LoadedQuestionsGoQuizSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { LoadedQuestionsGoQuizGame } from "./Game.js";

const settings = { dummy: { kind: "boolean" as const, label: "dummy", default: false } } as const;
type S = SettingsOf<typeof settings>;

export const loadedQuestionsGoQuizPlugin: GamePlugin<LoadedQuestionsGoQuizState, LoadedQuestionsGoQuizAction, typeof settings> = {
  id: "loaded-questions-go-quiz",
  title: "Loaded Questions Go Quiz",
  category: "cards",
  players: { min: 1, max: 1, multiplayer: false },
  description: "LQ Go trivia.",
  howToPlay: "Loaded Questions Go Quiz solo trivia: 10 multiple-choice questions about the game's flavor and rules. Earn 10 points per correct answer plus speed and streak bonuses.",
  settings,
  initialState: (seed: number, s: S) => initialState(seed, s as LoadedQuestionsGoQuizSettings),
  reducer,
  isTerminal,
  component: LoadedQuestionsGoQuizGame,
};

export default loadedQuestionsGoQuizPlugin;
