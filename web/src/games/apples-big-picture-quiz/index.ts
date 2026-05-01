import type { GamePlugin, SettingsOf } from "../../platform/game-plugin/types.js";
import type { ApplesBigPictureQuizState, ApplesBigPictureQuizAction, ApplesBigPictureQuizSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { ApplesBigPictureQuizGame } from "./Game.js";

const settings = { dummy: { kind: "boolean" as const, label: "dummy", default: false } } as const;
type S = SettingsOf<typeof settings>;

export const apples_big_picture_quiz_plugin: GamePlugin<ApplesBigPictureQuizState, ApplesBigPictureQuizAction, typeof settings> = {
  id: "apples-big-picture-quiz",
  title: "Apples Big Picture Quiz",
  category: "cards",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Big Picture variant trivia.",
  howToPlay: "Apples Big Picture Quiz solo trivia: 10 multiple-choice questions about the game's flavor and rules. Earn 10 points per correct answer plus speed and streak bonuses.",
  settings,
  initialState: (seed: number, s: S) => initialState(seed, s as ApplesBigPictureQuizSettings),
  reducer,
  isTerminal,
  component: ApplesBigPictureQuizGame,
};

export default apples_big_picture_quiz_plugin;
