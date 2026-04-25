import type { GamePlugin } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { DanceQuizState, DanceQuizAction, DanceQuizSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { DanceQuiz } from "./Game.js";

const danceQuizPluginSettings = {
  questions: { kind: "enum" as const, label: "Questions", options: ["10", "20", "30"] as const, default: "10" as const },
} as const;

type ST = SettingsOf<typeof danceQuizPluginSettings>;

export const danceQuizPlugin: GamePlugin<DanceQuizState, DanceQuizAction, typeof danceQuizPluginSettings> = {
  id: "dance-quiz",
  title: "Dance Quiz",
  category: "board",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Test your knowledge of dance styles from ballet and tango to breakdancing and K-pop.",
  howToPlay: `Dance Quiz challenges your knowledge of the world's most beloved and expressive art form. Questions cover classical ballet, world folk dances, social dance history, famous choreographers, iconic dance moves, and the cultural roots of styles from tango to bhangra.

You have 15 seconds per question. Correct answers earn 100 base points plus a speed bonus of 10 points per second remaining. Fast accurate answers maximize your score.

Click a choice to select it, then press Submit. The correct answer highlights green; wrong choices turn red. Press Next to continue.

Choose 10, 20, or 30 questions in Settings. Questions cover everything from Swan Lake to Gangnam Style.

Score and accuracy are displayed at the end. Whether you are a seasoned dancer or a curious fan, Dance Quiz will keep you moving!`,
  settings: danceQuizPluginSettings,
  initialState: (seed: number, s: ST) => initialState(seed, s as DanceQuizSettings),
  reducer, isTerminal, component: DanceQuiz,
};
