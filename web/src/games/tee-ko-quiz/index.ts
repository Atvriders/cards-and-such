import type { GamePlugin, SettingsOf, HintTarget } from "../../platform/game-plugin/types.js";
import type { TeeKoQuizState, TeeKoQuizAction, TeeKoQuizSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { TeeKoQuizGame } from "./Game.js";

const settings = { dummy: { kind: "boolean" as const, label: "dummy", default: false } } as const;
type S = SettingsOf<typeof settings>;

export const teeKoQuizPlugin: GamePlugin<TeeKoQuizState, TeeKoQuizAction, typeof settings> = {
  id: "tee-ko-quiz",
  title: "Tee K.O. Quiz",
  category: "cards",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Shirt-design party trivia.",
  howToPlay: "Tee K.O. Quiz solo trivia: 10 multiple-choice questions about the game's flavor and rules. Earn 10 points per correct answer plus speed and streak bonuses.",
  settings,
  initialState: (seed: number, s: S) => initialState(seed, s as TeeKoQuizSettings),
  reducer,
  isTerminal,
  hint: (state: TeeKoQuizState): HintTarget | null => state.phase === "ask" ? { selector: '[data-testid="hint-target-quiz-answer-0"]', pulses: 3 } : null,
  component: TeeKoQuizGame,
};

export default teeKoQuizPlugin;
