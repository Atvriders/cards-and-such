import type { GamePlugin, SettingsOf } from "../../platform/game-plugin/types.js";
import type { PictionaryManiaQuizState, PictionaryManiaQuizAction, PictionaryManiaQuizSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { PictionaryManiaQuizGame } from "./Game.js";

const settings = { dummy: { kind: "boolean" as const, label: "dummy", default: false } } as const;
type S = SettingsOf<typeof settings>;

export const pictionary_mania_quiz_plugin: GamePlugin<PictionaryManiaQuizState, PictionaryManiaQuizAction, typeof settings> = {
  id: "pictionary-mania-quiz",
  title: "Pictionary Mania Quiz",
  category: "cards",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Mania variant trivia.",
  howToPlay: "Pictionary Mania Quiz solo trivia: 10 multiple-choice questions about the game's flavor and rules. Earn 10 points per correct answer plus speed and streak bonuses.",
  settings,
  initialState: (seed: number, s: S) => initialState(seed, s as PictionaryManiaQuizSettings),
  reducer,
  isTerminal,
  component: PictionaryManiaQuizGame,
};

export default pictionary_mania_quiz_plugin;
