import type { GamePlugin, SettingsOf } from "../../platform/game-plugin/types.js";
import type { Drawful2QuizState, Drawful2QuizAction, Drawful2QuizSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { Drawful2QuizGame } from "./Game.js";

const settings = { dummy: { kind: "boolean" as const, label: "dummy", default: false } } as const;
type S = SettingsOf<typeof settings>;

export const drawful2QuizPlugin: GamePlugin<Drawful2QuizState, Drawful2QuizAction, typeof settings> = {
  id: "drawful-2-quiz",
  title: "Drawful 2 Quiz",
  category: "cards",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Drawful 2 trivia.",
  howToPlay: "Drawful 2 Quiz solo trivia: 10 multiple-choice questions about the game's flavor and rules. Earn 10 points per correct answer plus speed and streak bonuses.",
  settings,
  initialState: (seed: number, s: S) => initialState(seed, s as Drawful2QuizSettings),
  reducer,
  isTerminal,
  component: Drawful2QuizGame,
};

export default drawful2QuizPlugin;
