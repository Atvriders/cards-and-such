import type { GamePlugin, HintTarget } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { HerbsQuizState, HerbsQuizAction, HerbsQuizSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { HerbsQuiz } from "./Game.js";

const herbsQuizSettings = {
  questions: {
    kind: "enum" as const,
    label: "Questions",
    options: ["10", "20", "30"] as const,
    default: "10" as const,
  },
} as const;

type HerbsQuizSettingsType = SettingsOf<typeof herbsQuizSettings>;

export const herbsQuizPlugin: GamePlugin<HerbsQuizState, HerbsQuizAction, typeof herbsQuizSettings> = {
  id: "herbs-quiz",
  title: "Herbs Quiz",
  category: "board",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Test your knowledge of culinary and medicinal herbs — from fragrant basil and rosemary to powerful echinacea and valerian.",
  howToPlay: `Herbs Quiz challenges your knowledge of the plant world's most useful and fragrant members. Questions cover culinary herbs used in global kitchens, medicinal herbs with centuries of history, aromatic plants and their active compounds, and surprising herb facts from botany and culture.

You have 15 seconds to answer each question. A correct answer earns 100 base points plus a speed bonus of 10 points per second remaining. Fast, accurate answers maximize your final score.

Click a choice to select it, then press Submit. After answering, the correct option highlights green and any wrong selection turns red. Press Next to continue to the next question.

Use Settings to choose 10, 20, or 30 questions. Questions are drawn from a pool of 30 herb facts covering species from chamomile and lavender to turmeric, tarragon, and ginseng.

Your final score and accuracy are displayed at the end. Whether you are a home cook, an herbalist, or simply a curious learner, Herbs Quiz is sure to spice up your botanical knowledge!`,
  settings: herbsQuizSettings,
  initialState: (seed: number, settings: HerbsQuizSettingsType) => initialState(seed, settings as HerbsQuizSettings),
  reducer,
  isTerminal,
  hint: (state: HerbsQuizState): HintTarget | null => state.phase === "playing" ? { selector: '[data-testid="hint-target-quiz-answer-0"]', pulses: 3 } : null,
  component: HerbsQuiz,
};
