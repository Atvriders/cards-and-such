import { lazy } from "react";
import type * as React from "react";
import type { GamePlugin, HintTarget } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { TransportationQuizState, TransportationQuizAction } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
const TransportationQuiz = /* @__PURE__ */ lazy(() => import("./TransportationQuiz.js").then((mod) => ({ default: mod.TransportationQuiz as unknown as React.ComponentType<unknown> })));
export const transportationQuizSettings = { questionCount: { kind: "enum" as const, label: "Questions", options: ["5", "10", "15"] as const, default: "10" as const } } as const;
type S = SettingsOf<typeof transportationQuizSettings>;
export const transportationQuizPlugin: GamePlugin<TransportationQuizState, TransportationQuizAction, typeof transportationQuizSettings> = {
  id: "transportation-quiz", title: "Transportation Quiz", category: "board",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Test your knowledge of vehicles, infrastructure, and transportation history.",
  howToPlay: `Transportation Quiz challenges your knowledge of the systems and vehicles that move people and goods around the world. Questions cover the history of aviation, rail systems, canals, road infrastructure, and modern innovations. Select the correct answer from four choices. Correct answers turn green; wrong ones turn red while the right answer is revealed. Earn 10 points per correct answer. Choose 5, 10, or 15 questions in settings. Topics include airline history, bullet trains, the Panama Canal, GPS technology, autonomous vehicles, and hybrid engines. Tips: Japan pioneered high-speed rail (Shinkansen). Germany built the first highway system (Autobahn). The world's busiest airport is in Atlanta. Concorde flew at Mach 2.`,
  settings: transportationQuizSettings,
  initialState: (seed: number, settings: S) => initialState(seed, settings),
  reducer, isTerminal,
  hint: (state: TransportationQuizState): HintTarget | null => !state.done ? { selector: '[data-testid="hint-target-quiz-answer-0"]', pulses: 3 } : null,
  component: TransportationQuiz,
};
