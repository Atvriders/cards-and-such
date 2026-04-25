import type { GamePlugin } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { WarsQuizState, WarsQuizAction, WarsQuizSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { WarsQuiz } from "./Game.js";

const warsQuizPluginSettings = {
  questions: { kind: "enum" as const, label: "Questions", options: ["10", "20", "30"] as const, default: "10" as const },
} as const;

type ST = SettingsOf<typeof warsQuizPluginSettings>;

export const warsQuizPlugin: GamePlugin<WarsQuizState, WarsQuizAction, typeof warsQuizPluginSettings> = {
  id: "wars-quiz",
  title: "Wars Quiz",
  category: "board",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Test your knowledge of history's major conflicts — from ancient battles to modern wars and pivotal turning points.",
  howToPlay: `Wars Quiz challenges your knowledge of the conflicts that shaped the world. Questions cover famous battles and their outcomes, war start and end dates, causes of major conflicts, key commanders, and the political consequences of history's most significant wars.

You have 15 seconds per question. Correct answers earn 100 base points plus a speed bonus of 10 points per second remaining. Fast accurate answers maximize your score.

Click a choice to select it, then press Submit. The correct answer highlights green; wrong choices turn red. Press Next to continue.

Choose 10, 20, or 30 questions in Settings. Questions span conflicts from the Peloponnesian War to the Gulf War and beyond.

Score and accuracy are displayed at the end. Whether you are a history buff or a military strategy fan, Wars Quiz will test your battlefield knowledge!`,
  settings: warsQuizPluginSettings,
  initialState: (seed: number, s: ST) => initialState(seed, s as WarsQuizSettings),
  reducer, isTerminal, component: WarsQuiz,
};
