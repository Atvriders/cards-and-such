import { lazy } from "react";
import type * as React from "react";
import type { GamePlugin, HintTarget } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { QuizState, QuizAction, QuizSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
const MythologyQuiz = /* @__PURE__ */ lazy(() => import("./Game.js").then((mod) => ({ default: mod.MythologyQuiz as unknown as React.ComponentType<unknown> })));
const mythologyQuizSettings = {
  questions: {
    kind: "enum" as const,
    label: "Questions",
    options: ["10", "20", "30"] as const,
    default: "10" as const,
  },
} as const;

type MythologyQuizSettingsType = SettingsOf<typeof mythologyQuizSettings>;

export const mythologyQuizPlugin: GamePlugin<QuizState, QuizAction, typeof mythologyQuizSettings> = {
  id: "mythology-quiz",
  title: "Mythology Quiz",
  category: "board",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Dive into the myths and legends of ancient cultures — Greek, Roman, Norse, Egyptian, Hindu, Aztec, and more.",
  howToPlay: `Mythology Quiz challenges your knowledge of the myths, gods, heroes, and legends from civilizations around the world. Questions draw from Greek, Roman, Norse, Egyptian, Hindu, Aztec, Celtic, Japanese, and Mesopotamian mythology — covering deities, legendary heroes, epic quests, and mythical creatures.

You have 15 seconds per question. A correct answer earns 100 base points plus a 10-point speed bonus for every second still on the clock. The faster you answer, the higher your score — but only if you're right!

Click your chosen answer to highlight it, then press Submit. After submitting, the correct answer is shown in green. Any wrong selection turns red. Press Next to move to the next question.

Configure the session length in Settings — 10 questions for a quick myth fix, 20 for a deeper exploration, or 30 for a full heroic odyssey. Questions are randomly chosen from a bank of 32 mythology facts covering cultures across four continents.

See your final score and accuracy at the end of the game. Become a true mythologist by mastering legends from every corner of the ancient world!`,
  settings: mythologyQuizSettings,
  initialState: (seed: number, settings: MythologyQuizSettingsType) => initialState(seed, settings as QuizSettings),
  reducer,
  isTerminal,
  hint: (state: QuizState): HintTarget | null => state.phase === "playing" ? { selector: '[data-testid="hint-target-quiz-answer-0"]', pulses: 3 } : null,
  component: MythologyQuiz,
};
