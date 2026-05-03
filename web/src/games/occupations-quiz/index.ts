import { lazy } from "react";
import type * as React from "react";
import type { GamePlugin, HintTarget } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { OccupationsQuizState, OccupationsQuizAction, OccupationsQuizSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
const OccupationsQuiz = /* @__PURE__ */ lazy(() => import("./Game.js").then((mod) => ({ default: mod.OccupationsQuiz as unknown as React.ComponentType<unknown> })));
const occupationsQuizSettings = {
  questions: {
    kind: "enum" as const,
    label: "Questions",
    options: ["10", "20", "30"] as const,
    default: "10" as const,
  },
} as const;

type OccupationsQuizSettingsType = SettingsOf<typeof occupationsQuizSettings>;

export const occupationsQuizPlugin: GamePlugin<OccupationsQuizState, OccupationsQuizAction, typeof occupationsQuizSettings> = {
  id: "occupations-quiz",
  title: "Occupations Quiz",
  category: "board",
  players: { min: 1, max: 1, multiplayer: false },
  description: "How well do you know jobs and professions? Test your knowledge of occupations from farriers and coopers to cryptographers and sommeliers.",
  howToPlay: `Occupations Quiz challenges you to match jobs with their descriptions. Questions span historical trades, modern professions, medical specialties, and obscure vocations from around the world — from the familiar to the wonderfully obscure.

You have 15 seconds to answer each question. A correct answer earns 100 base points plus a speed bonus of 10 points per second remaining. Answer quickly to earn the most.

Click a choice to select it, then press Submit. The correct option highlights green after submission; wrong selections turn red. Press Next to continue.

Use Settings to choose 10, 20, or 30 questions drawn from a pool of 30 occupations questions covering trades, sciences, crafts, and professions.

Your final score and accuracy are shown at the end. Whether you are a career counselor or just curious about what people do for a living, Occupations Quiz will challenge and surprise you!`,
  settings: occupationsQuizSettings,
  initialState: (seed: number, settings: OccupationsQuizSettingsType) => initialState(seed, settings as OccupationsQuizSettings),
  reducer,
  isTerminal,
  hint: (state: OccupationsQuizState): HintTarget | null => state.phase === "playing" ? { selector: '[data-testid="hint-target-quiz-answer-0"]', pulses: 3 } : null,
  component: OccupationsQuiz,
};
