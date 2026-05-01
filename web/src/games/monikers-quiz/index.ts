import type { GamePlugin, SettingsOf } from "../../platform/game-plugin/types.js";
import type { MonikersQuizState, MonikersQuizAction, MonikersQuizSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { MonikersQuizGame } from "./Game.js";

const settings = { dummy: { kind: "boolean" as const, label: "dummy", default: false } } as const;
type S = SettingsOf<typeof settings>;

export const monikers_quiz_plugin: GamePlugin<MonikersQuizState, MonikersQuizAction, typeof settings> = {
  id: "monikers-quiz",
  title: "Monikers Quiz",
  category: "cards",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Three-round party game trivia.",
  howToPlay: "Monikers Quiz solo trivia: 10 multiple-choice questions about the game's flavor and rules. Earn 10 points per correct answer plus speed and streak bonuses.",
  settings,
  initialState: (seed: number, s: S) => initialState(seed, s as MonikersQuizSettings),
  reducer,
  isTerminal,
  component: MonikersQuizGame,
};

export default monikers_quiz_plugin;
