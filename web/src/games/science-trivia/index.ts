import { lazy } from "react";
import type * as React from "react";
import type { GamePlugin, HintTarget } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { QuizState, QuizAction, QuizSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
const ScienceTrivia = /* @__PURE__ */ lazy(() => import("./Game.js").then((mod) => ({ default: mod.ScienceTrivia as unknown as React.ComponentType<unknown> })));
const scienceTriviaSettings = {
  questions: {
    kind: "enum" as const,
    label: "Questions",
    options: ["10", "20", "30"] as const,
    default: "10" as const,
  },
} as const;

type ScienceTriviaSettingsType = SettingsOf<typeof scienceTriviaSettings>;

export const scienceTriviaPlugin: GamePlugin<QuizState, QuizAction, typeof scienceTriviaSettings> = {
  id: "science-trivia",
  title: "Science Trivia",
  category: "board",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Explore the world of science — physics, chemistry, biology, astronomy, and famous discoveries that shaped our understanding of the universe.",
  howToPlay: `Science Trivia tests your knowledge across all branches of science. Questions cover physics, chemistry, biology, astronomy, earth science, and the scientists who made landmark discoveries. From atomic structure to the laws of motion, from DNA to black holes, every answer teaches you something about our world.

You have 15 seconds to answer each question. A correct answer earns 100 base points plus a speed bonus of 10 points for every second remaining on the clock. Buzzing in fast with the right answer is the path to a top score.

Click a choice to select it, then press Submit. After submitting, you'll see the correct answer highlighted in green. Any wrong selection is highlighted in red. Press Next to continue.

Use Settings to choose 10, 20, or 30 questions. Questions are randomly selected from a pool of 32 carefully written science facts. Concepts range from introductory to moderately advanced, making it fun for students and science enthusiasts alike.

Review your final score and accuracy at the end of the game. Push yourself to score higher each time as you deepen your scientific knowledge!`,
  settings: scienceTriviaSettings,
  initialState: (seed: number, settings: ScienceTriviaSettingsType) => initialState(seed, settings as QuizSettings),
  reducer,
  isTerminal,
  
  hint: (state: QuizState): HintTarget | null => state.phase === "playing" ? { selector: '[data-testid="hint-target-science-trivia-answer-0"]', pulses: 3 } : null,component: ScienceTrivia,
};
