import type { GamePlugin, SettingsOf } from "../../platform/game-plugin/types.js";
import type { JackboxPack1QuizState, JackboxPack1QuizAction, JackboxPack1QuizSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { JackboxPack1QuizGame } from "./Game.js";

const settings = { dummy: { kind: "boolean" as const, label: "dummy", default: false } } as const;
type S = SettingsOf<typeof settings>;

export const jackboxPack1QuizPlugin: GamePlugin<JackboxPack1QuizState, JackboxPack1QuizAction, typeof settings> = {
  id: "jackbox-pack-1-quiz",
  title: "Jackbox Pack 1 Quiz",
  category: "cards",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Pack 1 trivia.",
  howToPlay: "Jackbox Pack 1 Quiz solo trivia: 10 multiple-choice questions about the game's flavor and rules. Earn 10 points per correct answer plus speed and streak bonuses.",
  settings,
  initialState: (seed: number, s: S) => initialState(seed, s as JackboxPack1QuizSettings),
  reducer,
  isTerminal,
  component: JackboxPack1QuizGame,
};

export default jackboxPack1QuizPlugin;
