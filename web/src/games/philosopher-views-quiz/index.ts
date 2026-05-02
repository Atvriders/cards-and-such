import type { GamePlugin, HintTarget } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { PhilosopherViewsQuizState, PhilosopherViewsQuizAction } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { PhilosopherViewsQuiz } from "./Game.js";

export const philosopherViewsQuizSettings = {
  questionCount: { kind: "enum" as const, label: "Questions", options: ["5", "10", "15"] as const, default: "10" as const },
} as const;

type S = SettingsOf<typeof philosopherViewsQuizSettings>;

export const philosopherViewsQuizPlugin: GamePlugin<PhilosopherViewsQuizState, PhilosopherViewsQuizAction, typeof philosopherViewsQuizSettings> = {
  id: "philosopher-views-quiz",
  title: "Philosopher Views Quiz",
  category: "board",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Match famous philosophical ideas and quotes to the thinker who held them.",
  howToPlay: `Philosopher Views Quiz tests your knowledge of history's greatest thinkers and their ideas. Each question describes a philosophical concept, famous quote, or key work and asks you to identify the philosopher who held that view.

Select the philosopher you believe is correct to earn 10 points. Correct answers reveal in green; wrong ones in red. Press Next for the next question.

Questions span Western and Eastern philosophy from ancient Greece through the twentieth century. You will encounter Socrates, Plato, Aristotle, Descartes, Kant, Hegel, Nietzsche, Marx, Sartre, and many more.

Choose 5, 10, or 15 questions per round. The 15-question session offers the broadest philosophical tour.

Tips: Look for keywords tied to specific schools — 'categorical imperative' and 'duty' point to Kant; 'forms' and 'allegory' to Plato; 'Übermensch' to Nietzsche. Existentialist clues like 'existence precedes essence' or 'absurd' narrow to Sartre or Camus. The question's historical period is also a strong guide: ancient Greek questions rarely have modern answers. Eliminate philosophers from the wrong era first, then use doctrine keywords.`,
  settings: philosopherViewsQuizSettings,
  initialState: (seed: number, settings: S) => initialState(seed, settings),
  reducer,
  isTerminal,
  hint: (state: PhilosopherViewsQuizState): HintTarget | null => !state.done ? { selector: '[data-testid="hint-target-quiz-answer-0"]', pulses: 3 } : null,
  component: PhilosopherViewsQuiz,
};
