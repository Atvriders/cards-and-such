import type { GamePlugin, SettingsOf } from "../../platform/game-plugin/types.js";
import type { Fibbage3QuizState, Fibbage3QuizAction, Fibbage3QuizSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { Fibbage3QuizGame } from "./Game.js";

const settings = { dummy: { kind: "boolean" as const, label: "dummy", default: false } } as const;
type S = SettingsOf<typeof settings>;

export const fibbage3QuizPlugin: GamePlugin<Fibbage3QuizState, Fibbage3QuizAction, typeof settings> = {
  id: "fibbage-3-quiz",
  title: "Fibbage 3 Quiz",
  category: "cards",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Fibbage 3 trivia.",
  howToPlay: "Fibbage 3 Quiz solo trivia: 10 multiple-choice questions about the game's flavor and rules. Earn 10 points per correct answer plus speed and streak bonuses.",
  settings,
  initialState: (seed: number, s: S) => initialState(seed, s as Fibbage3QuizSettings),
  reducer,
  isTerminal,
  component: Fibbage3QuizGame,
};

export default fibbage3QuizPlugin;
