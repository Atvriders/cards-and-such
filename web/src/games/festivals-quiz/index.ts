import type { GamePlugin, HintTarget } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { FestivalsQuizState, FestivalsQuizAction } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { FestivalsQuiz } from "./FestivalsQuiz.js";
export const festivalsQuizSettings = { questionCount: { kind: "enum" as const, label: "Questions", options: ["5", "10", "15"] as const, default: "10" as const } } as const;
type S = SettingsOf<typeof festivalsQuizSettings>;
export const festivalsQuizPlugin: GamePlugin<FestivalsQuizState, FestivalsQuizAction, typeof festivalsQuizSettings> = {
  id: "festivals-quiz", title: "Festivals Quiz", category: "board",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Test your knowledge of celebrations and festivals from cultures around the world.",
  howToPlay: `Festivals Quiz takes you on a global tour of cultural celebrations, religious observances, and seasonal traditions. Each question covers a famous festival — its country, meaning, timing, or associated customs. Select the correct answer from four choices. Correct answers turn green; wrong ones turn red with the right answer revealed. Earn 10 points per correct answer. Choose 5, 10, or 15 questions in settings. Topics include Diwali, Holi, Mardi Gras, Oktoberfest, La Tomatina, Songkran, Carnival, and many others. Tips: Link festivals to their home countries — Oktoberfest is German, Songkran is Thai. Religious festivals often relate to the calendar of their parent religion. Water, lights, and fire are common festival themes.`,
  settings: festivalsQuizSettings,
  initialState: (seed: number, settings: S) => initialState(seed, settings),
  reducer, isTerminal,
  hint: (state: FestivalsQuizState): HintTarget | null => !state.done ? { selector: '[data-testid="hint-target-quiz-answer-0"]', pulses: 3 } : null,
  component: FestivalsQuiz,
};
