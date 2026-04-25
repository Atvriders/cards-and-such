import type { GamePlugin } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { QuizState, QuizAction, QuizSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { ReptilesQuiz } from "./Game.js";

const reptilesQuizSettings = {
  questions: { kind: "enum" as const, label: "Questions", options: ["10", "20", "30"] as const, default: "10" as const },
} as const;

type ReptilesQuizSettingsType = SettingsOf<typeof reptilesQuizSettings>;

export const reptilesQuizPlugin: GamePlugin<QuizState, QuizAction, typeof reptilesQuizSettings> = {
  id: "reptiles-quiz",
  title: "Reptiles Quiz",
  category: "board",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Explore the reptile kingdom — snakes, lizards, crocodilians, turtles, and their cold-blooded secrets.",
  howToPlay: `Reptiles Quiz slithers through the scaly world of crocodilians, lizards, snakes, turtles, and the ancient tuatara. Questions cover anatomy, behavior, venomous species, records, and the evolutionary history linking reptiles to both dinosaurs and birds.

You have 15 seconds per question. Correct answers earn 100 base points plus 10 points per second left on the clock — speed and accuracy both count!

Click a choice, then press Submit to lock in your answer. After each question the correct option highlights green and wrong picks turn red. Press Next to advance.

Settings let you choose 10, 20, or 30 questions from a 30-question pool. Topics include chameleon color change, snake venom, gecko adhesion, sea turtle navigation, crocodilian parental care, and more.

Final score and accuracy are shown at the end. From casual nature fans to aspiring herpetologists, Reptiles Quiz will delight anyone fascinated by Earth's scaly survivors!`,
  settings: reptilesQuizSettings,
  initialState: (seed: number, settings: ReptilesQuizSettingsType) => initialState(seed, settings as QuizSettings),
  reducer,
  isTerminal,
  component: ReptilesQuiz,
};
