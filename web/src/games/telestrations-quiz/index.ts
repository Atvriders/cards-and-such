import type { GamePlugin, SettingsOf, HintTarget } from "../../platform/game-plugin/types.js";
import type { TelestrationsQuizState, TelestrationsQuizAction, TelestrationsQuizSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { TelestrationsQuizGame } from "./Game.js";

const settings = { dummy: { kind: "boolean" as const, label: "dummy", default: false } } as const;
type S = SettingsOf<typeof settings>;

export const telestrationsQuizPlugin: GamePlugin<TelestrationsQuizState, TelestrationsQuizAction, typeof settings> = {
  id: "telestrations-quiz",
  title: "Telestrations Quiz",
  category: "cards",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Trivia about the sketching telephone party game.",
  howToPlay: "Telestrations Quiz solo trivia: 10 multiple-choice questions about the game's flavor and rules. Earn 10 points per correct answer plus speed and streak bonuses.",
  settings,
  initialState: (seed: number, s: S) => initialState(seed, s as TelestrationsQuizSettings),
  reducer,
  isTerminal,
  hint: (state: TelestrationsQuizState): HintTarget | null => state.phase === "ask" ? { selector: '[data-testid="hint-target-quiz-answer-0"]', pulses: 3 } : null,
  component: TelestrationsQuizGame,
};

export default telestrationsQuizPlugin;
