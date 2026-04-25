import type { GamePlugin } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { QuizState, QuizAction, QuizSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { AnimalQuiz } from "./Game.js";

const animalQuizSettings = {
  questions: {
    kind: "enum" as const,
    label: "Questions",
    options: ["10", "20", "30"] as const,
    default: "10" as const,
  },
} as const;

type AnimalQuizSettingsType = SettingsOf<typeof animalQuizSettings>;

export const animalQuizPlugin: GamePlugin<QuizState, QuizAction, typeof animalQuizSettings> = {
  id: "animal-quiz",
  title: "Animal Quiz",
  category: "board",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Explore the animal kingdom — mammals, reptiles, insects, birds, marine life, and fascinating facts about Earth's incredible creatures.",
  howToPlay: `Animal Quiz explores the extraordinary diversity of life on Earth. Questions cover mammals, birds, reptiles, fish, insects, and other creatures — testing your knowledge of animal behavior, anatomy, habitats, record-holders, and the surprising adaptations that help animals survive.

You have 15 seconds to answer each question. A correct answer earns 100 base points plus a speed bonus of 10 points per second remaining on the clock. Answer quickly to maximize your score.

Click a choice to select it, then press Submit. After answering, the correct option is highlighted green and any wrong selection turns red. Press Next to move to the next question.

Use the Settings panel to choose 10, 20, or 30 questions. Questions are randomly selected from a curated pool of 32 animal facts covering creatures from every corner of the planet — from the depths of the ocean to the top of the highest mountains.

Your final score and accuracy are shown at the end. From casual nature lovers to dedicated zoologists, Animal Quiz offers something to surprise and delight every animal enthusiast!`,
  settings: animalQuizSettings,
  initialState: (seed: number, settings: AnimalQuizSettingsType) => initialState(seed, settings as QuizSettings),
  reducer,
  isTerminal,
  component: AnimalQuiz,
};
