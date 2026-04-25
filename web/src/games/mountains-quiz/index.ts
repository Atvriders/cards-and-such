import type { GamePlugin } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { QuizState, QuizAction, QuizSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { MountainsQuiz } from "./Game.js";

const mountainsQuizSettings = {
  questions: { kind: "enum" as const, label: "Questions", options: ["10", "20", "30"] as const, default: "10" as const },
} as const;

type MountainsQuizSettingsType = SettingsOf<typeof mountainsQuizSettings>;

export const mountainsQuizPlugin: GamePlugin<QuizState, QuizAction, typeof mountainsQuizSettings> = {
  id: "mountains-quiz",
  title: "Mountains Quiz",
  category: "board",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Scale the heights of mountain knowledge — peaks, ranges, records, and the science of mountains.",
  howToPlay: `Mountains Quiz takes you to the top of the world. Questions cover the highest peaks on every continent, famous mountain ranges, geological formation, mountaineering history, the Seven Summits, and the unique challenges of high-altitude environments.

You have 15 seconds per question. A correct answer earns 100 base points plus 10 bonus points per second remaining on the clock — be fast and accurate!

Click a choice to select it, then press Submit. After each question the correct option highlights green and wrong picks turn red. Press Next to continue.

Use Settings to choose 10, 20, or 30 questions from a pool of 30. Topics range from Everest and K2 to the Death Zone, mountain weather, glacier science, and the tallest peak measured from Earth's center.

Final score and accuracy are shown at the end. Whether you dream of summits or just love geography, Mountains Quiz will challenge and inspire every aspiring alpinist!`,
  settings: mountainsQuizSettings,
  initialState: (seed: number, settings: MountainsQuizSettingsType) => initialState(seed, settings as QuizSettings),
  reducer,
  isTerminal,
  component: MountainsQuiz,
};
