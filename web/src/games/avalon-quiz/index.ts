import type { GamePlugin, SettingsOf } from "../../platform/game-plugin/types.js";
import type { AvalonQuizState, AvalonQuizAction, AvalonQuizSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { AvalonQuizGame } from "./Game.js";

const settings = { dummy: { kind: "boolean" as const, label: "dummy", default: false } } as const;
type S = SettingsOf<typeof settings>;

export const avalon_quiz_plugin: GamePlugin<AvalonQuizState, AvalonQuizAction, typeof settings> = {
  id: "avalon-quiz",
  title: "Avalon Quiz",
  category: "cards",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Avalon trivia.",
  howToPlay: "Avalon Quiz solo trivia: 10 multiple-choice questions about the game's flavor and rules. Earn 10 points per correct answer plus speed and streak bonuses.",
  settings,
  initialState: (seed: number, s: S) => initialState(seed, s as AvalonQuizSettings),
  reducer,
  isTerminal,
  component: AvalonQuizGame,
};

export default avalon_quiz_plugin;
