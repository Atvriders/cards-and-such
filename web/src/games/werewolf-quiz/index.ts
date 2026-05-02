import type { GamePlugin, SettingsOf, HintTarget } from "../../platform/game-plugin/types.js";
import type { WerewolfQuizState, WerewolfQuizAction, WerewolfQuizSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { WerewolfQuizGame } from "./Game.js";

const settings = { dummy: { kind: "boolean" as const, label: "dummy", default: false } } as const;
type S = SettingsOf<typeof settings>;

export const werewolfQuizPlugin: GamePlugin<WerewolfQuizState, WerewolfQuizAction, typeof settings> = {
  id: "werewolf-quiz",
  title: "Werewolf Quiz",
  category: "cards",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Werewolf hidden-role trivia.",
  howToPlay: "Werewolf Quiz solo trivia: 10 multiple-choice questions about the game's flavor and rules. Earn 10 points per correct answer plus speed and streak bonuses.",
  settings,
  initialState: (seed: number, s: S) => initialState(seed, s as WerewolfQuizSettings),
  reducer,
  isTerminal,
  hint: (state: WerewolfQuizState): HintTarget | null => state.phase === "ask" ? { selector: '[data-testid="hint-target-quiz-answer-0"]', pulses: 3 } : null,
  component: WerewolfQuizGame,
};

export default werewolfQuizPlugin;
