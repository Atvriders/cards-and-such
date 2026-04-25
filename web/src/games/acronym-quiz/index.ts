import type { GamePlugin } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { AcronymQuizState, AcronymQuizAction } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { AcronymQuiz } from "./AcronymQuiz.js";

export const acronymQuizSettings = {
  questionCount: {
    kind: "enum" as const,
    label: "Questions",
    options: ["5", "10", "15"] as const,
    default: "10" as const,
  },
} as const;

type AcronymQuizSettingsType = SettingsOf<typeof acronymQuizSettings>;

export const acronymQuizPlugin: GamePlugin<AcronymQuizState, AcronymQuizAction, typeof acronymQuizSettings> = {
  id: "acronym-quiz",
  title: "Acronym Quiz",
  category: "board",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Test your knowledge of common acronyms — pick the correct full phrase for each abbreviation.",
  howToPlay: `Acronym Quiz challenges you to identify the full phrase behind common abbreviations and acronyms. Each round shows you an acronym — such as NASA, DNA, or URL — and presents four possible definitions. Your job is to tap or click the correct one.

After selecting an answer the correct choice turns green. If you picked the wrong one it turns red while the correct answer is revealed in green. You then advance to the next question with the Next button.

Each correct answer earns 10 points. The game ends after all questions are answered, displaying your total score out of the maximum.

You can choose 5, 10, or 15 questions per session in the settings. Shorter sessions are good for a quick challenge; the full 15-question set covers science, technology, sports, politics, and international organizations.

Tips: Acronyms from technology often relate to universal or uniform concepts — look for those keywords. Science acronyms like DNA and RNA contain nucleic acid. Government acronyms frequently reference federal, national, or bureau. When uncertain, eliminate answers with wrong first-letter expansions.`,
  settings: acronymQuizSettings,
  initialState: (seed: number, settings: AcronymQuizSettingsType) => initialState(seed, settings),
  reducer,
  isTerminal,
  component: AcronymQuiz,
};
