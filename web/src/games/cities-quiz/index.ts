import { lazy } from "react";
import type * as React from "react";
import type { GamePlugin, HintTarget } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { QuizState, QuizAction, QuizSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
const CitiesQuiz = /* @__PURE__ */ lazy(() => import("./Game.js").then((mod) => ({ default: mod.CitiesQuiz as unknown as React.ComponentType<unknown> })));
const citiesQuizSettings = {
  questions: { kind: "enum" as const, label: "Questions", options: ["10", "20", "30"] as const, default: "10" as const },
} as const;

type CitiesQuizSettingsType = SettingsOf<typeof citiesQuizSettings>;

export const citiesQuizPlugin: GamePlugin<QuizState, QuizAction, typeof citiesQuizSettings> = {
  id: "cities-quiz",
  title: "Cities Quiz",
  category: "board",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Travel the world's greatest cities — capitals, nicknames, records, and urban geography facts.",
  howToPlay: `Cities Quiz takes you on a global tour of the world's most iconic urban centres. Questions cover capital cities, population records, famous nicknames, cultural significance, geographic features, and the unique stories behind the cities that define our world.

You have 15 seconds per question. A correct answer earns 100 base points plus 10 bonus points for each second remaining — fast answers score highest!

Click a choice to select it, then press Submit. After each question the correct option highlights green and wrong choices turn red. Press Next to move on.

Use Settings to choose 10, 20, or 30 questions from a pool of 30 city facts. Topics include the most populous, highest, northernmost, and most visited cities — as well as famous monuments and cultural capitals.

Final score and accuracy are shown at the end. Whether you are a traveler, geography student, or armchair explorer, Cities Quiz is your ticket to a world tour from your screen!`,
  settings: citiesQuizSettings,
  initialState: (seed: number, settings: CitiesQuizSettingsType) => initialState(seed, settings as QuizSettings),
  reducer,
  isTerminal,
  hint: (state: QuizState): HintTarget | null => state.phase === "playing" ? { selector: '[data-testid="hint-target-quiz-answer-0"]', pulses: 3 } : null,
  component: CitiesQuiz,
};
