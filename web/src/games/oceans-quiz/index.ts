import { lazy } from "react";
import type * as React from "react";
import type { GamePlugin, HintTarget } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { QuizState, QuizAction, QuizSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
const OceansQuiz = /* @__PURE__ */ lazy(() => import("./Game.js").then((mod) => ({ default: mod.OceansQuiz as unknown as React.ComponentType<unknown> })));
const oceansQuizSettings = {
  questions: { kind: "enum" as const, label: "Questions", options: ["10", "20", "30"] as const, default: "10" as const },
} as const;

type OceansQuizSettingsType = SettingsOf<typeof oceansQuizSettings>;

export const oceansQuizPlugin: GamePlugin<QuizState, QuizAction, typeof oceansQuizSettings> = {
  id: "oceans-quiz",
  title: "Oceans Quiz",
  category: "board",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Dive deep into ocean science — currents, zones, marine life, and the forces that shape Earth's seas.",
  howToPlay: `Oceans Quiz plunges you into Earth's vast blue domain — covering 71% of the planet's surface. Questions span ocean zones, currents, tides, marine ecosystems, record depths, and the critical role oceans play in climate and life on Earth.

You have 15 seconds per question. A correct answer earns 100 base points plus 10 bonus points for each second left on the clock — fast and accurate is the way to go!

Click a choice to select it, then press Submit. After each question the correct answer lights green and wrong choices turn red. Press Next to continue.

Use Settings to choose 10, 20, or 30 questions from a pool of 30 ocean facts. Topics include the Mariana Trench, thermohaline circulation, bioluminescence, coral reefs, gyres, and the threats facing our oceans today.

Final score and accuracy are shown at the end. Whether you love marine biology, geography, or environmental science, Oceans Quiz will deepen your understanding of our blue planet!`,
  settings: oceansQuizSettings,
  initialState: (seed: number, settings: OceansQuizSettingsType) => initialState(seed, settings as QuizSettings),
  reducer,
  isTerminal,
  hint: (state: QuizState): HintTarget | null => state.phase === "playing" ? { selector: '[data-testid="hint-target-quiz-answer-0"]', pulses: 3 } : null,
  component: OceansQuiz,
};
