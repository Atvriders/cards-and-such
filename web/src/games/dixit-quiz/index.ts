import type { GamePlugin, SettingsOf } from "../../platform/game-plugin/types.js";
import type { DixitQuizState, DixitQuizAction, DixitQuizSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { DixitQuizGame } from "./Game.js";

const settings = { dummy: { kind: "boolean" as const, label: "dummy", default: false } } as const;
type S = SettingsOf<typeof settings>;

export const dixit_quiz_plugin: GamePlugin<DixitQuizState, DixitQuizAction, typeof settings> = {
  id: "dixit-quiz",
  title: "Dixit Quiz",
  category: "cards",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Dixit storytelling trivia.",
  howToPlay: "Dixit Quiz solo trivia: 10 multiple-choice questions about the game's flavor and rules. Earn 10 points per correct answer plus speed and streak bonuses.",
  settings,
  initialState: (seed: number, s: S) => initialState(seed, s as DixitQuizSettings),
  reducer,
  isTerminal,
  component: DixitQuizGame,
};

export default dixit_quiz_plugin;
