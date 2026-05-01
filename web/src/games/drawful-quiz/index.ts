import type { GamePlugin, SettingsOf } from "../../platform/game-plugin/types.js";
import type { DrawfulQuizState, DrawfulQuizAction, DrawfulQuizSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { DrawfulQuizGame } from "./Game.js";

const settings = { dummy: { kind: "boolean" as const, label: "dummy", default: false } } as const;
type S = SettingsOf<typeof settings>;

export const drawful_quiz_plugin: GamePlugin<DrawfulQuizState, DrawfulQuizAction, typeof settings> = {
  id: "drawful-quiz",
  title: "Drawful Quiz",
  category: "cards",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Drawful sketch-guess trivia.",
  howToPlay: "Drawful Quiz solo trivia: 10 multiple-choice questions about the game's flavor and rules. Earn 10 points per correct answer plus speed and streak bonuses.",
  settings,
  initialState: (seed: number, s: S) => initialState(seed, s as DrawfulQuizSettings),
  reducer,
  isTerminal,
  component: DrawfulQuizGame,
};

export default drawful_quiz_plugin;
