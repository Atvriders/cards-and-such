import type { GamePlugin, HintTarget } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { DictatorsQuizState, DictatorsQuizAction } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { DictatorsQuiz } from "./DictatorsQuiz.js";
export const dictatorsQuizSettings = { questionCount: { kind: "enum" as const, label: "Questions", options: ["5", "10", "15"] as const, default: "10" as const } } as const;
type S = SettingsOf<typeof dictatorsQuizSettings>;
export const dictatorsQuizPlugin: GamePlugin<DictatorsQuizState, DictatorsQuizAction, typeof dictatorsQuizSettings> = {
  id: "dictators-quiz", title: "Dictators Quiz", category: "board",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Test your knowledge of history's authoritarian rulers and their regimes.",
  howToPlay: `Dictators Quiz tests your knowledge of the authoritarian leaders who shaped modern history. Questions cover which country each dictator ruled, their political parties, key events of their regimes, and their historical significance. Select the correct answer from four options. Correct answers turn green; wrong picks turn red. Earn 10 points per correct answer. Choose 5, 10, or 15 questions in settings. Leaders covered include Hitler, Stalin, Mao Zedong, Mussolini, Castro, Gaddafi, Pol Pot, and others. Tips: Match leaders to their home countries — Stalin to the Soviet Union, Mao to China, Castro to Cuba. Political party names are distinctive — Nazis in Germany, Fascists in Italy. Regimes are often named after their country's communist or nationalist movement.`,
  settings: dictatorsQuizSettings,
  initialState: (seed: number, settings: S) => initialState(seed, settings),
  reducer, isTerminal,
  hint: (state: DictatorsQuizState): HintTarget | null => !state.done ? { selector: '[data-testid="hint-target-quiz-answer-0"]', pulses: 3 } : null,
  component: DictatorsQuiz,
};
