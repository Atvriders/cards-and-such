import type { GamePlugin, SettingsOf } from "../../platform/game-plugin/types.js";
import type { PictionaryCardGameQuizState, PictionaryCardGameQuizAction, PictionaryCardGameQuizSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { PictionaryCardGameQuizGame } from "./Game.js";

const settings = { dummy: { kind: "boolean" as const, label: "dummy", default: false } } as const;
type S = SettingsOf<typeof settings>;

export const pictionaryCardGameQuizPlugin: GamePlugin<PictionaryCardGameQuizState, PictionaryCardGameQuizAction, typeof settings> = {
  id: "pictionary-card-game-quiz",
  title: "Pictionary Card Game Quiz",
  category: "cards",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Card-game version trivia.",
  howToPlay: "Pictionary Card Game Quiz solo trivia: 10 multiple-choice questions about the game's flavor and rules. Earn 10 points per correct answer plus speed and streak bonuses.",
  settings,
  initialState: (seed: number, s: S) => initialState(seed, s as PictionaryCardGameQuizSettings),
  reducer,
  isTerminal,
  component: PictionaryCardGameQuizGame,
};

export default pictionaryCardGameQuizPlugin;
