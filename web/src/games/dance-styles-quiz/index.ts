import { lazy } from "react";
import type * as React from "react";
import type { GamePlugin, HintTarget } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { DanceStylesQuizState, DanceStylesQuizAction } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
const DanceStylesQuiz = /* @__PURE__ */ lazy(() => import("./Game.js").then((mod) => ({ default: mod.DanceStylesQuiz as unknown as React.ComponentType<unknown> })));
export const danceStylesQuizSettings = {
  questionCount: { kind: "enum" as const, label: "Questions", options: ["5", "10", "15"] as const, default: "10" as const },
} as const;

type S = SettingsOf<typeof danceStylesQuizSettings>;

export const danceStylesQuizPlugin: GamePlugin<DanceStylesQuizState, DanceStylesQuizAction, typeof danceStylesQuizSettings> = {
  id: "dance-styles-quiz",
  title: "Dance Styles Quiz",
  category: "board",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Test your knowledge of dance styles from around the world — tango to breakdance.",
  howToPlay: `Dance Styles Quiz challenges you to identify dance forms from cultures around the world. Each question describes a dance style — its origin, movement, or cultural context — and presents four possible answers.

Select the correct dance name to earn 10 points. After choosing, the correct answer turns green and incorrect selections turn red. Tap Next to move forward.

The quiz covers classical, folk, Latin, street, and theatrical dance traditions spanning five continents. You may encounter ballet, flamenco, lindy hop, breaking, bharatanatyam, kabuki, and many more.

Settings allow you to choose 5, 10, or 15 questions. Shorter sessions are quick fun; a full 15-question round gives a thorough tour of global dance history.

Tips: Focus on geographic clues — if the question mentions Argentina, think tango; Brazil hints at samba; Spain at flamenco. Rhythmic descriptions can also help: bouncy suggests samba, rapid footwork suggests step dance. When in doubt, eliminate answers from the wrong continent first, then narrow by era or style.`,
  settings: danceStylesQuizSettings,
  initialState: (seed: number, settings: S) => initialState(seed, settings),
  reducer,
  isTerminal,
  hint: (state: DanceStylesQuizState): HintTarget | null => !state.done ? { selector: '[data-testid="hint-target-quiz-answer-0"]', pulses: 3 } : null,
  component: DanceStylesQuiz,
};
