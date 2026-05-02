import type { GamePlugin, SettingsOf } from "../../platform/game-plugin/types.js";
import type { JackboxPack7QuizState, JackboxPack7QuizAction, JackboxPack7QuizSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { JackboxPack7QuizGame } from "./Game.js";

const settings = { dummy: { kind: "boolean" as const, label: "dummy", default: false } } as const;
type S = SettingsOf<typeof settings>;

export const jackboxPack7QuizPlugin: GamePlugin<JackboxPack7QuizState, JackboxPack7QuizAction, typeof settings> = {
  id: "jackbox-pack-7-quiz",
  title: "Jackbox Pack 7 Quiz",
  category: "cards",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Pack 7 trivia.",
  howToPlay: "Jackbox Pack 7 Quiz solo trivia: 10 multiple-choice questions about the game's flavor and rules. Earn 10 points per correct answer plus speed and streak bonuses.",
  settings,
  initialState: (seed: number, s: S) => initialState(seed, s as JackboxPack7QuizSettings),
  reducer,
  isTerminal,
  component: JackboxPack7QuizGame,
};

export default jackboxPack7QuizPlugin;
