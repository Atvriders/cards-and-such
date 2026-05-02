import type { GamePlugin, SettingsOf, HintTarget } from "../../platform/game-plugin/types.js";
import type { TelestrationsAfterDarkQuizState, TelestrationsAfterDarkQuizAction, TelestrationsAfterDarkQuizSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { TelestrationsAfterDarkQuizGame } from "./Game.js";

const settings = { dummy: { kind: "boolean" as const, label: "dummy", default: false } } as const;
type S = SettingsOf<typeof settings>;

export const telestrationsAfterDarkQuizPlugin: GamePlugin<TelestrationsAfterDarkQuizState, TelestrationsAfterDarkQuizAction, typeof settings> = {
  id: "telestrations-after-dark-quiz",
  title: "Telestrations: After Dark Quiz",
  category: "cards",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Adult-edition Telestrations trivia.",
  howToPlay: "Telestrations: After Dark Quiz solo trivia: 10 multiple-choice questions about the game's flavor and rules. Earn 10 points per correct answer plus speed and streak bonuses.",
  settings,
  initialState: (seed: number, s: S) => initialState(seed, s as TelestrationsAfterDarkQuizSettings),
  reducer,
  isTerminal,
  hint: (state: TelestrationsAfterDarkQuizState): HintTarget | null => state.phase === "ask" ? { selector: '[data-testid="hint-target-quiz-answer-0"]', pulses: 3 } : null,
  component: TelestrationsAfterDarkQuizGame,
};

export default telestrationsAfterDarkQuizPlugin;
