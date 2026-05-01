import type { GamePlugin, SettingsOf } from "../../platform/game-plugin/types.js";
import type { Spyfall2QuizState, Spyfall2QuizAction, Spyfall2QuizSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { Spyfall2QuizGame } from "./Game.js";

const settings = { dummy: { kind: "boolean" as const, label: "dummy", default: false } } as const;
type S = SettingsOf<typeof settings>;

export const spyfall_2_quiz_plugin: GamePlugin<Spyfall2QuizState, Spyfall2QuizAction, typeof settings> = {
  id: "spyfall-2-quiz",
  title: "Spyfall 2 Quiz",
  category: "cards",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Spyfall 2 trivia.",
  howToPlay: "Spyfall 2 Quiz solo trivia: 10 multiple-choice questions about the game's flavor and rules. Earn 10 points per correct answer plus speed and streak bonuses.",
  settings,
  initialState: (seed: number, s: S) => initialState(seed, s as Spyfall2QuizSettings),
  reducer,
  isTerminal,
  component: Spyfall2QuizGame,
};

export default spyfall_2_quiz_plugin;
