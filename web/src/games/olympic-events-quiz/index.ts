import { lazy } from "react";
import type * as React from "react";
import type { GamePlugin, HintTarget } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { OlympicEventsQuizState, OlympicEventsQuizAction } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
const OlympicEventsQuiz = /* @__PURE__ */ lazy(() => import("./OlympicEventsQuiz.js").then((mod) => ({ default: mod.OlympicEventsQuiz as unknown as React.ComponentType<unknown> })));
export const olympicEventsQuizSettings = { questionCount: { kind: "enum" as const, label: "Questions", options: ["5", "10", "15"] as const, default: "10" as const } } as const;
type S = SettingsOf<typeof olympicEventsQuizSettings>;
export const olympicEventsQuizPlugin: GamePlugin<OlympicEventsQuizState, OlympicEventsQuizAction, typeof olympicEventsQuizSettings> = {
  id: "olympic-events-quiz", title: "Olympic Events Quiz", category: "board",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Test your knowledge of the Olympics — history, events, records, and traditions.",
  howToPlay: `Olympic Events Quiz takes you through the history, rules, and traditions of the Olympic Games. Questions cover the founding of the modern Olympics, medal compositions, famous events, host cities, and multi-sport disciplines like the decathlon and triathlon. Select the correct answer from four options. Correct answers turn green; wrong picks turn red. Earn 10 points per correct answer with 5, 10, or 15 questions available. Topics include the history of women in the Olympics, record-breaking distances, martial arts origins, and the torch relay. Tips: The modern Olympics were founded in Athens in 1896 but women joined in 1900. The Olympic flag has 5 rings. Multi-event competitions like the decathlon have 10 events and the pentathlon has 5.`,
  settings: olympicEventsQuizSettings,
  initialState: (seed: number, settings: S) => initialState(seed, settings),
  reducer, isTerminal,
  hint: (state: OlympicEventsQuizState): HintTarget | null => !state.done ? { selector: '[data-testid="hint-target-quiz-answer-0"]', pulses: 3 } : null,
  component: OlympicEventsQuiz,
};
