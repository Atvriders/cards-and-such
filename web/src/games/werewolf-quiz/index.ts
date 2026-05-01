import type { GamePlugin, SettingsOf } from "../../platform/game-plugin/types.js";
import type { WerewolfQuizState, WerewolfQuizAction, WerewolfQuizSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { WerewolfQuizGame } from "./Game.js";

const settings = { dummy: { kind: "boolean" as const, label: "dummy", default: false } } as const;
type S = SettingsOf<typeof settings>;

export const werewolf_quiz_plugin: GamePlugin<WerewolfQuizState, WerewolfQuizAction, typeof settings> = {
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
  component: WerewolfQuizGame,
};

export default werewolf_quiz_plugin;
