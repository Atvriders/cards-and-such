import type { GamePlugin, SettingsOf } from "../../platform/game-plugin/types.js";
import type { WitsWagersQuizState, WitsWagersQuizAction, WitsWagersQuizSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { WitsWagersQuizGame } from "./Game.js";

const settings = { dummy: { kind: "boolean" as const, label: "dummy", default: false } } as const;
type S = SettingsOf<typeof settings>;

export const wits_wagers_quiz_plugin: GamePlugin<WitsWagersQuizState, WitsWagersQuizAction, typeof settings> = {
  id: "wits-wagers-quiz",
  title: "Wits & Wagers Quiz",
  category: "cards",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Wits & Wagers trivia.",
  howToPlay: "Wits & Wagers Quiz solo trivia: 10 multiple-choice questions about the game's flavor and rules. Earn 10 points per correct answer plus speed and streak bonuses.",
  settings,
  initialState: (seed: number, s: S) => initialState(seed, s as WitsWagersQuizSettings),
  reducer,
  isTerminal,
  component: WitsWagersQuizGame,
};

export default wits_wagers_quiz_plugin;
