import type { GamePlugin, SettingsOf } from "../../platform/game-plugin/types.js";
import type { PictionaryManQuizState, PictionaryManQuizAction, PictionaryManQuizSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { PictionaryManQuizGame } from "./Game.js";

const settings = { dummy: { kind: "boolean" as const, label: "dummy", default: false } } as const;
type S = SettingsOf<typeof settings>;

export const pictionaryManQuizPlugin: GamePlugin<PictionaryManQuizState, PictionaryManQuizAction, typeof settings> = {
  id: "pictionary-man-quiz",
  title: "Pictionary Man Quiz",
  category: "cards",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Pictionary Man trivia.",
  howToPlay: "Pictionary Man Quiz solo trivia: 10 multiple-choice questions about the game's flavor and rules. Earn 10 points per correct answer plus speed and streak bonuses.",
  settings,
  initialState: (seed: number, s: S) => initialState(seed, s as PictionaryManQuizSettings),
  reducer,
  isTerminal,
  component: PictionaryManQuizGame,
};

export default pictionaryManQuizPlugin;
