import type { GamePlugin, SettingsOf } from "../../platform/game-plugin/types.js";
import type { PictionaryBaseQuizState, PictionaryBaseQuizAction, PictionaryBaseQuizSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { PictionaryBaseQuizGame } from "./Game.js";

const settings = { dummy: { kind: "boolean" as const, label: "dummy", default: false } } as const;
type S = SettingsOf<typeof settings>;

export const pictionaryBaseQuizPlugin: GamePlugin<PictionaryBaseQuizState, PictionaryBaseQuizAction, typeof settings> = {
  id: "pictionary-base-quiz",
  title: "Pictionary Quiz",
  category: "cards",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Pictionary trivia.",
  howToPlay: "Pictionary Quiz solo trivia: 10 multiple-choice questions about the game's flavor and rules. Earn 10 points per correct answer plus speed and streak bonuses.",
  settings,
  initialState: (seed: number, s: S) => initialState(seed, s as PictionaryBaseQuizSettings),
  reducer,
  isTerminal,
  component: PictionaryBaseQuizGame,
};

export default pictionaryBaseQuizPlugin;
