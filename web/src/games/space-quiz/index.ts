import type { GamePlugin, HintTarget } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { QuizState, QuizAction, QuizSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { SpaceQuiz } from "./Game.js";

const spaceQuizSettings = {
  questions: {
    kind: "enum" as const,
    label: "Questions",
    options: ["10", "20", "30"] as const,
    default: "10" as const,
  },
} as const;

type SpaceQuizSettingsType = SettingsOf<typeof spaceQuizSettings>;

export const spaceQuizPlugin: GamePlugin<QuizState, QuizAction, typeof spaceQuizSettings> = {
  id: "space-quiz",
  title: "Space Quiz",
  category: "board",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Blast off into the cosmos — planets, stars, galaxies, space missions, black holes, and the science of the universe.",
  howToPlay: `Space Quiz launches you on an interstellar adventure through our solar system and beyond. Questions cover planets and their moons, famous space missions, astronauts, telescopes, stars, black holes, galaxies, and the fundamental science of the cosmos.

You have 15 seconds to answer each question. A correct answer earns 100 base points plus a speed bonus of 10 points per second remaining on the clock. Lightning-fast correct answers unlock the highest scores — hesitate and you lose out on precious bonus points.

Click a choice to select it, then press Submit. After submitting, the correct answer is highlighted green and any wrong pick turns red. Click Next to continue your journey through the stars.

Set the session length in Settings — 10 questions for a short launch window, 20 for a full mission, or 30 for a grand interstellar expedition. Questions are randomly drawn from a curated bank of 32 space and astronomy facts.

Your total score and accuracy appear at the end of the game. Whether you're an armchair astronomer or a future astronaut, Space Quiz will test the limits of your cosmic knowledge!`,
  settings: spaceQuizSettings,
  initialState: (seed: number, settings: SpaceQuizSettingsType) => initialState(seed, settings as QuizSettings),
  reducer,
  isTerminal,
  hint: (state: QuizState): HintTarget | null => state.phase === "playing" ? { selector: '[data-testid="hint-target-quiz-answer-0"]', pulses: 3 } : null,
  component: SpaceQuiz,
};
