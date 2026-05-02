import type { GamePlugin, HintTarget } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { FashionErasQuizState, FashionErasQuizAction } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { FashionErasQuiz } from "./Game.js";

export const fashionErasQuizSettings = {
  questionCount: { kind: "enum" as const, label: "Questions", options: ["5", "10", "15"] as const, default: "10" as const },
} as const;

type S = SettingsOf<typeof fashionErasQuizSettings>;

export const fashionErasQuizPlugin: GamePlugin<FashionErasQuizState, FashionErasQuizAction, typeof fashionErasQuizSettings> = {
  id: "fashion-eras-quiz",
  title: "Fashion Eras Quiz",
  category: "board",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Match fashion trends to their era — from Victorian corsets to 1980s power suits.",
  howToPlay: `Fashion Eras Quiz challenges you to match iconic clothing styles, silhouettes, and trends to the correct historical period. Each question describes a distinctive fashion trait and offers four era choices.

Pick the matching era to earn 10 points. Right answers turn green; wrong ones turn red with the correct era revealed. Press Next to advance.

The quiz spans ancient civilizations, European royal courts, the Industrial Revolution, twentieth-century decades, and modern streetwear culture. Expect questions about specific garments like poodle skirts, platform shoes, flapper dresses, and doublets.

Choose 5, 10, or 15 questions per session. The full 15-question round covers the widest range of fashion history.

Tips: Decade clues in the description make many answers obvious — look for cultural markers like neon, disco, or grunge. Silhouette keywords help: a cinched waist and full skirt points to the late 1940s; an S-curve corset to the Edwardian period. When the clue mentions a designer name, think of their peak active decade. Eliminate eras that don't fit geographically or culturally first.`,
  settings: fashionErasQuizSettings,
  initialState: (seed: number, settings: S) => initialState(seed, settings),
  reducer,
  isTerminal,
  hint: (state: FashionErasQuizState): HintTarget | null => !state.done ? { selector: '[data-testid="hint-target-quiz-answer-0"]', pulses: 3 } : null,
  component: FashionErasQuiz,
};
